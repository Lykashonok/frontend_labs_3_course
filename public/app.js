import { HomeController } from "./home/home.component.js";
import { AboutController } from "./about/about.component.js";
import { Router } from "./router.js";

window.router = new Router({
    "home" : {name: "Home", root: true, controller: new HomeController("home")},
    "about" : {name: "About", root: false, controller: new AboutController("about")}
});
window.router.init();