import { BaseController, PageData } from "../vl/BaseController.js";
import { localStorageGet, USER_ID, USER_NAME } from "../vl/localStorage.js";
import { getRandom } from "../vl/funcs.js"

export class CreateController extends BaseController {
    name = "";
    max = "";
    type = "";
    wordsNumber = 100;

    vlOnInit() {
        this.name = "Igra";
    }

    createSubmit() {
        let ref = firebase.database().ref();
        let words = [];

        // For closure
        let name = this.name;
        let type = this.type;
        let max = this.max;
        ref.child('vocabolary').on("value", snapshot => {
            ref.child('vocabolary').off("value");
            words = getRandom(snapshot.val(), this.wordsNumber)
            let userId = localStorageGet(USER_ID);

            let id = firebase.database().ref().child('games').push({
                type        : type,
                status      : "preparing",
                turn        : 0,
                endTurn     : max,
                name        : name,
                host        : userId,
                current     : userId,
                currentWord : words.shift(),
                words       : words,
                messages    : "null",
                users       : [
                    // Put current user
                    {name: localStorageGet(USER_NAME), guessed: 0, id: userId}
                ],
            }).key;
            window.router.action(`/${type}/${id}`);
        })
    }
}
