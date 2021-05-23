import { MainController } from "./main/main-component.js";
// import { CrocodileController } from "./crocodile/crocodile.js";
import { AliasController } from "./alias/alias-component.js";
import { HeaderController } from "./header/header-component.js";
import { FooterController } from "./footer/footer-component.js";
import { ListController } from "./list/list-component.js";
import { AuthController } from "./auth/auth-component.js";
import { CreateController } from "./create/create-component.js";
import { Router } from "./vl/router.js";

window.router = new Router({
    "main"          : {name: "Home",        root: true,  controller: new MainController("/main/main-component.html")},
    // "crocodile/:id" : {name: "Crocodile",   root: false, controller: new CrocodileController("/crocodile/crocodile.html", ["/crocodile/crocodile.css"])},
    "list"          : {name: "List",        root: false, controller: new ListController("/list/list-component.html")},
    "alias/:id"     : {name: "Alias",       root: false, controller: new AliasController("/alias/alias-component.html", ["/alias/alias-component.css"]), needAuth: true},
    "auth"          : {name: "Auth",        root: false, controller: new AuthController("/auth/auth-component.html")},
    "create"        : {name: "Create",      root: false, controller: new CreateController("/create/create-component.html"), needAuth: true},
});
window.router.init(
    new HeaderController("/header/header-component.html", ["/header/header-component.css"]),
    new FooterController("/footer/footer-component.html", ["/footer/footer-component.css"]),
);