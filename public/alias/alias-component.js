import { BaseController, PageData } from "../vl/BaseController.js";
import { localStorageGet, USER_ID, USER_NAME } from "../vl/localStorage.js";
import { AdjustingInterval } from "../vl/timer.js"

export class AliasController extends BaseController {
    current = ""; // current User Id
    currentWord;
    endTurn = 0;
    host = "";
    name = ""; // Game name
    status = "";
    users = [];
    current = 0;
    messages = [];

    userId = "";

    isCurrent = false;          // is user is current
    isHost = false;             // is user is host
    isPreparingPhase = false;   // is phase is preparing

    ref = null;

    async vlOnInit() {
        let url = `games/${this.props['id']}`;
        this.ref = firebase.database().ref().child(url);
        this.userId = localStorageGet(USER_ID);
        this.isEnd = false;

        let snapshot = await this.ref.once("value");
        let game = snapshot.val();
        this.populateGame(game);

        this.ref.on("value", async (snapshot) => {
            let game = snapshot.val();
            this.isCurrent = game['current'] == this.userId;
            if (game['status'] == 'active') {
                this.isPreparingPhase = false;
                if (!this.isCurrent) {
                    this.showActions = false;
                } else {
                    this.showActions = true;
                    this.startTimer();
                }
            } else if (game['status'] == 'preparing') {
                if (this.isCurrent) {
                    this.isPreparingPhase = true;
                    this.showActions = true;
                } else {
                    this.isPreparingPhase = false;
                    this.showActions = false;
                }
            } else if (game['status'] == 'waiting') {
                if (this.isCurrent) {
                    this.showActions = false;
                    this.isPreparingPhase = false;
                }
            } else if (game['status'] == 'end') {
                this.ref.off("value")
                this.isPreparingPhase = false;
                this.showActions = false;
                this.messages = [];
                await this.gameEnd();
                return;
            }
            this.populateGame(game);
        })


        if (this.userId == game['current']) {
            this.showActions = true;
            if (game['status'] == 'preparing') {
                this.isPreparingPhase = true;
            }
        }
    }

    populateGame(game) {
        for (const key in game) {
            this[key] = game[key];
        }
    }

    async wordAction(action) {
        if (this.showActions) {
            let messageClass = ""
            if (action == "wrong") {
                messageClass = "alias-card_wrong";
            } else if (action == "guessed") {
                messageClass = "alias-card_right";
                let user = this.users.find(el => el.id == this.userId);
                user["guessed"] = user["guessed"] + 1;
            }
            if (!Array.isArray(this.messages)) {
                this.messages = [];
            }
            this.messages.unshift({text: this.currentWord, class: messageClass});
            this.currentWord = this.words.shift();
            await this.updateGame({
                status: "timer",
                messages: this.messages,
                currentWord: this.currentWord,
                users: this.users,
            });
        }
    }

    updateStates() {
        for(const user of this.users) {
            let cl = [];
            if (user.id == this.userId) {    
                cl.push('user_own');
            }
            if (user.id == this.current) {
                cl.push('user_guesser');
            }

            user['class'] = cl.join(' ');
        }
        this.users = this.users;

        if (!this.isCurrent) {
            this.ref.on("value", snapshot => this.subscribeFunction(snapshot));
        }
    }

    subscribeFunction(snapshot) {
        let game = snapshot.val();
        this.populateGame(game)
    }

    async gameEnd() {
        let guessedArray = [];
        let max = 0, maxIndex = 0;
        this.isEnd = true;
        this.messages = [];
        for (let i = 0; i < this.users.length / 2; i++) {
            guessedArray[i] = 0;
            guessedArray[i] += this.users[i * 2]["guessed"];
            guessedArray[i] += this.users[i * 2 + 1]["guessed"];
            if (guessedArray[i] > max) {
                max = guessedArray[i];
                maxIndex = i;
            }
        }

        this.result = `End! ${this.users[maxIndex]['name']} and ${this.users[maxIndex+1]['name']} won with ${max} points!`;

        if (this.isCurrent) {
            let ref = firebase.database().ref().child('users/');
            for (const user of this.users) {
                let subRef = ref.child(`${user.id}/userInformation`);
                let incWins = false;
                if (this.users[maxIndex] == user || this.users[maxIndex + 1] == user) {
                    incWins = true;
                }
                let oldUserSnapshot = await subRef.once("value");
                let oldUser = oldUserSnapshot.val();
                await subRef.set({
                    wins: incWins? oldUser["wins"] + 1 : oldUser["wins"],
                    guessed: oldUser["guessed"] + user["guessed"]
                });
            }
            await this.ref.set(null);
        }
    }

    async changeGameStatus(status) {
        if (this.users.length % 2 != 0) {
            alert("Users number must be 2, 4, 6...");
            return;
        }
        await this.ref.update({status});
    }

    async changeTeam() {
        this.turn++;
        if (this.turn >= this.endTurn) {
            this.status = 'end';
            this.ref.update({status: 'end'});
            // this.current = null;
            // this.ref.off("value");
            // this.updateGame();
            // this.gameEnd();
            return;
        }
        let currentIndex = this.users.indexOf(this.users.find(el => el.id == this.current));

        if (currentIndex + 2 >= this.users.length) {
            currentIndex = this.users.length - currentIndex == 2 ? 1 : 0;
        } else {
            currentIndex += 2;
        }
        
        await this.updateGame({
            status: "preparing",
            current: this.users[currentIndex]['id'],
        });
    }

    async startTimer(isCurrent) {
        this.status = "timer";
        await this.ref.update({status: "timer"});
        let time = 3;
        let timerElement = document.getElementById("timer");
        timerElement.innerHTML = time;
        let ticker = new AdjustingInterval(() => {
            timerElement.innerHTML--;
            if (timerElement.innerHTML < 1) {
                ticker.stop();
                timerElement.innerHTML = "";
            }
        }, 1000)
        ticker.start();
        setTimeout(() => {
            ticker.stop()
            // After timer stops, changing status to waiting
            // To wait untill next team is ready to play
            this.changeTeam();
        }, (time + 1) * 1000)
    }

    async updateGame(obj) {
        for (let user of this.users) {
            delete user['class'];
        }
        await this.ref.set({
            words: this.words,
            users: this.users,
            messages: this.messages,
            currentWord: this.currentWord,
            current: this.current,
            turn: this.turn,
            status: this.status,
            ...obj
        });
    }

    changeWords(words) {
        this.ref.child('/words').update(words);
    }
}
