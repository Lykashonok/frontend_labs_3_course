import { BaseController, PageData } from "../vl/BaseController.js";
import { localStorageGet, localStoragePut, USER_ID, USER_NAME} from "../vl/localStorage.js"

export class AuthController extends BaseController {
    constructor(controllerTemplate, controllerStyles = []) {
        super(controllerTemplate, controllerStyles);
    }

    login = "";
    password = "";

    loginRegister = "";
    passwordRegister = "";
    passwordRepeatRegister = "";

    shiftClass = "overlay_shifted";

    switch(event) {
        let layout = event.target.parentNode.parentNode.parentNode;
        if (layout.classList.contains(this.shiftClass)) {
            layout.classList.remove(this.shiftClass);
        } else {
            layout.classList.add(this.shiftClass);
        }
    }

    loginSubmit() {
        this.loginErrorMessage = "";
        firebase.auth().signInWithEmailAndPassword(this.login, this.password)
            .then((userCredential) => {
                let currentUser = userCredential.user;
                localStoragePut(USER_ID, currentUser.uid);
                localStoragePut(USER_NAME, currentUser.email);
                if (window.router) {
                    window.router.action('/main', {});
                }
            })
            .catch((error) => {
                this.loginErrorMessage = error.message;
                console.error(error.code, error.message);
            });
    }

    registerSubmit() {
        let login = this.loginRegister, password = this.passwordRegister, passwordRepeat = this.passwordRepeatRegister;
        this.registerErrorMessage = "";
        if (password != passwordRepeat) {
            this.registerErrorMessage = "Passwords must be the same!";
            return;
        }
        firebase.auth().createUserWithEmailAndPassword(login, password)
            .then(userCredential => {
                let currentUser = userCredential.user;
                localStoragePut(USER_ID, currentUser.uid);
                localStoragePut(USER_NAME, currentUser.email);
                currentUser.updateProfile({
                    displayName: login
                }).then(() => {
                    firebase.database().ref('users/' +  currentUser.uid + '/userInformation/').set({
                        registrationDate : (new Date()),
                        guessed: 0,
                        displayName: currentUser["displayName"],
                        wins: 0,
                    });
                    if (window.router) {
                        window.router.action('/main', {});
                    }
                }).catch(error => {
                    this.registerErrorMessage = error.message;
                    console.error(error.code, JSON.parse(error.message));
                });
            }).catch(error => {
                this.registerErrorMessage = error.message;
                console.error(error.code, error.message);
            });
    }
}