import { HomeController } from "/js/controllers/HomeController.js";
import { AboutController } from "/js/controllers/AboutController.js";

window.router = new Router({
    "home" : {name: "Home", root: true, controller: new HomeController("home")},
    "about" : {name: "About", root: false, controller: new AboutController("about")}
});
window.router.init();