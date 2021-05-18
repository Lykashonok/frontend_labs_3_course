import { BaseController, PageData } from "../vl/BaseController.js";
import { localStorageGet, USER_ID, USER_NAME } from "../vl/localStorage.js";
import { AdjustingInterval } from "../vl/timer.js";

export class CrocodileController extends BaseController {
    canvas = null;
    ctx = null;
    // flag = false;
    // prevX = 0;
    // currX = 0;
    // prevY = 0;
    // currY = 0;
    // dot_flag = false;
    // x = "black";
    // y = 2;

    
    // selectColor(color) {
    //     switch (color) {
    //         case "green":   x = "green";    break;
    //         case "blue":    x = "blue";     break;
    //         case "red":     x = "red";      break;
    //         case "yellow":  x = "yellow";   break;
    //         case "orange":  x = "orange";   break;
    //         case "black":   x = "black";    break;
    //         case "white":   x = "white";    break;
    //     }
    //     this.y = this.x == "white" ? 14 : 2;
    // }
    
    // draw() {
    //     this.ctx.beginPath();
    //     this.ctx.moveTo(this.prevX, this.prevY);
    //     this.ctx.lineTo(this.currX, this.currY);
    //     this.ctx.strokeStyle = this.x;
    //     this.ctx.lineWidth = this.y;
    //     this.ctx.stroke();
    //     this.ctx.closePath();
    // }
    
    // erase() {
    //     var m = confirm("Want to clear");
    //     if (m) {
    //         this.ctx.clearRect(0, 0, this.w, this.h);
    //         document.getElementById("canvasimg").style.display = "none";
    //     }
    // }
    
    // save() {
    //     document.getElementById("canvasimg").style.border = "2px solid";
    //     var dataURL = canvas.toDataURL();
    //     document.getElementById("canvasimg").src = dataURL;
    //     document.getElementById("canvasimg").style.display = "inline";
    // }
    
    // findxy(res, e) {
    //     if (res == 'down') {
    //         this.prevX = this.currX;
    //         this.prevY = this.currY;
    //         this.currX = e.clientX - this.canvas.getBoundingClientRect().left;
    //         this.currY = e.clientY - this.canvas.getBoundingClientRect().top;
    //         this.flag = true;
    //         this.dot_flag = true;
    //         if (this.dot_flag) {
    //             this.ctx.beginPath();
    //             this.ctx.fillStyle = this.x;
    //             this.ctx.fillRect(this.currX, this.currY, 2, 2);
    //             this.ctx.closePath();
    //             this.dot_flag = false;
    //         }
    //     }
    //     if (res == 'up' || res == "out") {
    //         this.flag = false;
    //     }
    //     if (res == 'move') {
    //         if (this.flag) {
    //             this.prevX = this.currX;
    //             this.prevY = this.currY;
    //             this.currX = e.clientX - this.canvas.getBoundingClientRect().left;
    //             this.currY = e.clientY - this.canvas.getBoundingClientRect().top;
    //             this.draw();
    //         }
    //     }
    // }


    // old

    resize() {
        this.ctx.canvas.width = this.canvas.parentNode.innerWidth;
        this.ctx.canvas.height = this.canvas.parentNode.innerHeight;
    }

    pos = { x: 0, y: 0 };

    setPosition(e) {
        this.pos.x = e.clientX;
        this.pos.y = e.clientY;
    }

    draw(e) {
        // mouse left button must be pressed
        if (e.buttons !== 1) return;
      
        this.ctx.beginPath(); // begin
      
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.strokeStyle = '#c0392b';
      
        this.ctx.moveTo(this.pos.x, this.pos.y); // from
        this.setPosition(e);
        this.ctx.lineTo(this.pos.x, this.pos.y); // to
      
        this.ctx.stroke(); // draw it!
    }

    // new




    current = ""; // current User Id
    currentWord;
    endTurn = 0;
    host = "";
    name = ""; // Game name
    status = "";
    users = [];
    current = 0;
    messages = [];

    brushSize = 'small';
    brushColor = 'black';
    brushType = 'brush';

    userId = "";

    isCurrent = false;          // is user is current
    isHost = false;             // is user is host
    isPreparingPhase = false;   // is phase is preparing

    ref = null;

    selectColor(color) {
        this.brushColor = color;
    }

    selectSize(size) {
        this.brushSize = size;
    }

    selectType(type) {
        this.brushType = type;
    }    

    vlOnInit() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext("2d");
        // this.canvas.style.position = 'fixed';
        window.addEventListener('resize', e => this.resize(e));
        this.canvas.addEventListener('mousemove', e => this.draw(e));
        this.canvas.addEventListener('mousedown', e => this.setPosition(e));
        this.canvas.addEventListener('mouseenter', e => this.setPosition(e));
        
        // this.w = canvas.width; this.h = canvas.height;
        // canvas.addEventListener("mousemove", e => {this.findxy('move', e)}, false);
        // canvas.addEventListener("mousedown", e => {this.findxy('down', e)}, false);
        // canvas.addEventListener("mouseup",   e => {this.findxy('up',   e)}, false);
        // canvas.addEventListener("mouseout",  e => {this.findxy('out',  e)}, false);



        let url = `games/${this.props['id']}`;
        this.ref = firebase.database().ref().child(url);

        this.userId = localStorageGet(USER_ID);

        this.ref.on("value", snapshot => {
            let game = snapshot.val();
            if (game == null || game['users'] == undefined || game['users'].find(el => el.id == this.userId) == undefined) {
                // if he is random user dont let him enter
                window.router.action('/list');
            }

            if (!this.isEnd) {
                this.populateGame(game);
            }
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }

    populateGame(game) {
        for (const key in game) {
            this[key] = game[key];
        }
        this.updateStates();
    }

    wordAction(action) {
        this.updateGame();
    }

    updateStates() {
        this.users = this.users;

        // Checking wether user is current;

        this.isEnd = this.status == 'end';
        this.isCurrent = this.userId == this.current;
        // Checking wether user is host;
        this.isHost = this.userId == this.host && !this.isEnd;
        this.isPreparingPhase = (this.status == 'preparing' || this.status == 'waiting') && !this.isEnd;
        // players go in pairs. if your index and index of your party member
        // differs only by 1, hide current word
        // and inverse it for vlShow prop
        this.showActions = this.isCurrent && !this.isEnd;


        if (this.isEnd) {
            this.gameEnd();
        }
    }

    gameEnd() {
        let guessedArray = [];
        let max = 0, maxIndex = 0;
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
                subRef.on("value", snapshot => {
                    subRef.off("value");
                    let oldUser = snapshot.val();
                    subRef.set({guessed: oldUser["guessed"] + user["guessed"]});    
                })
            }

            setTimeout(() => this.ref.remove(), 1000);
        }
    }

    changeGameStatus(status) {
        if (this.users.length % 2 != 0) {
            alert("Users number must be 2, 4, 6...");
            return;
        }
        if (this.turn >= this.endTurn) {
            status = 'end';
        }
        switch(status) {
            case "preparing":
                // wait untill players connecting
                break;
            case "waiting":
                // next turn. Current user must be changed
                this.changeTeam();
                break;
            case "active":
                // timer is on
                this.startTimer();
                break;
            case "end":
                // update every user stats, show end button, which lead to game list
                console.log("game ended!");
                this.current = null;
                break;
            default:
                throw "Unknown game status!";
        }
        this.ref.set({status});
    }

    changeTeam() {
        this.turn++;
        if (this.turn >= this.endTurn) {
            this.status = "end";
            this.current = null;
            return this.changeGameStatus("end");
        }
        let currentIndex = this.users.indexOf(this.users.find(el => el.id == this.current));

        if (currentIndex + 2 >= this.users.length) {
            currentIndex = this.users.length - currentIndex == 2 ? 1 : 0;
        } else {
            currentIndex += 2;
        }
        this.current = this.users[currentIndex]['id'];
        this.messages = "null";
        this.updateStates();
        this.updateGame();
    }

    startTimer(justShow = false) {
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
            if (this.isCurrent && !justShow && !this.isEnd) {
                // After timer stops, changing status to waiting
                // To wait untill next team is ready to play
                if (this.turn + 1 <= this.endTurn){
                    console.log("changing status to waiting")
                    this.changeGameStatus("waiting");
                }
            }
        }, (time + 1) * 1000)
    }

    updateGame() {
        for (let user of this.users) {
            delete user['class'];
        }
        if (!this.isEnd) {
            this.ref.set({
                words: this.words,
                users: this.users,
                messages: this.messages,
                currentWord: this.currentWord,
                current: this.current,
                turn: this.turn,
                status: this.status,
            });
        }
    }

    changeWords(words) {
        this.ref.child('/words').update(words);
    }
}
