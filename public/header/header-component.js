import { BaseController, PageData } from "../vl/BaseController.js";
import { localStorageDelete, localStorageGet, USER_ID, USER_NAME } from "../vl/localStorage.js";

export class HeaderController extends BaseController {
    // to prevent from clearing css on navigation to new controller
    style_prefix = 'header_';
    displayName;

    navigate(event, path) {
        event.preventDefault();
        window.router.action(path);
    }

    logout(event, path) {
        event.preventDefault();
        firebase.auth().signOut();
        localStorageDelete(USER_ID);
        this.isAuth = false;
    }

    toggleNavBar() {
        var x = document.getElementById("topnav");
        if (x.className === "topnav"){ 
          x.classList.add("topnav_opened");
        } else {
          x.classList.remove("topnav_opened");
        }
    }

    vlOnInit() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                localStorage.setItem(USER_ID, user.uid);
                this.displayName = user['displayName'] ? user['displayName'] : "account";
                this.isAuth = true;
            } else {
                localStorageDelete(USER_ID);
                this.isAuth = false;
            }
        });
    }
}
