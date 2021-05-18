import { BaseController, PageData } from "../vl/BaseController.js";
import { localStorageGet, localStoragePut, USER_ID, USER_NAME} from "../vl/localStorage.js";

export class MainController extends BaseController {
    vlOnInit() {
        let url = `users`;
        let ref = firebase.database().ref().child(url);
        this.test = false;
        ref.on("value", snapshot => {
            let users = Object.values(snapshot.val()).map(el => el['userInformation']);
            for (const user of users) {
                user["wins"] = user["wins"] ? user["wins"] : 0;
                user["total"] = (user["wins"] ? user["wins"] : 0) * 10 + (user["guessed"] ? user["guessed"] : 0) * 2;
            }
            users.sort((a, b) => b["total"] - a["total"]);
            this.users = users;

        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        
        let userId = localStorageGet(USER_ID);
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                let userRef = firebase.database().ref().child(`users/${userId}/userInformation`);
                userRef.on("value", snapshot => {
                    let userInfo = snapshot.val();
                    this.displayName = user.displayName;
                    this.wins = userInfo['wins'] ? userInfo['wins'] : 0;
                    this.guessed = userInfo['guessed'];
                    this.registrationDate = userInfo['registrationDate'];
                });
                this.isAuth = true;
            } else {
                this.isAuth = false;
            }
        });
    }
}
