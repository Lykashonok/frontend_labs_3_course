import { BaseController, PageData } from "../vl/BaseController.js";
import { localStorageGet, localStoragePut, USER_ID, USER_NAME} from "../vl/localStorage.js";

export class ListController extends BaseController {
    place = "1";
    games = [];

    testSwitch() {
        this.test = !this.test;
    }
    vlOnInit() {
        let url = `games`;
        let ref = firebase.database().ref().child(url);
        this.test = false;
        ref.on("value", snapshot => {
            let games = snapshot.val();
            this.populateGames(games);
            // ref.off("value");
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        
        let userId = localStorageGet(USER_ID);
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                let userRef = firebase.database().ref().child(`users/${userId}/userInformation`);
                userRef.on("value", snapshot => {
                    let userInfo = snapshot.val();
                    if (userInfo != null) {
                        this.displayName = user.displayName;
                        this.wins = userInfo['wins'] ? userInfo['wins'] : 0;
                        this.guessed = userInfo['guessed'];
                        this.registrationDate = userInfo['registrationDate'];
                    }
                });
                this.isAuth = true;
            } else {
                this.isAuth = false;
            }
        });
    }

    populateGames(games) {
        let newGames = [];
        for (const game in games) {
            if (games[game]["status"] == 'preparing') {
                newGames.push({
                    ...games[game], 
                    length: games[game]["users"] ? games[game]["users"].length : 0,
                    id: game,
                });
            }
        }
        this.games = newGames;
    }

    async toGame(event, gameId, gameType) {
        event.preventDefault();
        let url = `games/${gameId}`;
        let ref = firebase.database().ref().child(url + '/users');
        await ref.on("value", async snapshot => {
            ref.off("value");
            let users = snapshot.val();
            let userId = localStorageGet(USER_ID);
            let userName = localStorageGet(USER_NAME);
            if (users.find(el => el['id'] == userId) == undefined) {
                users.push({
                    guessed: 0,
                    id: userId,
                    name: userName
                });
                await ref.set(users);
            }
        }, (errorObject) => {
            console.log("The read failed: " + errorObject.code);
        });
        window.router.action(`/${gameType}/${gameId}`);
    }
}
