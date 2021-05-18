import { isFunction, parseQuery } from "./funcs.js";

const app_id = "app";
const header_id = "header";
const footer_id = "footer";

/*
    state = {
        name: "route_name",
        action: "route_action",
        data: {},
        prop: value
    }
*/

export class Router {
    routes = [];
    header = null;
    footer = null;
    constructor(routes) {
        this.routes = routes;
        for (const route in this.routes) {
            this.routes[route]["controller"].target = document.getElementById(app_id);
        }
    }
    init(headerController, footerController) {
        if (headerController != null) {
            this.header = headerController;
            this.header.target = document.getElementById(header_id);
            this.launchController(this.header);
        }
        if (footerController != null) {
            this.footer = footerController;
            this.footer.target = document.getElementById(footer_id);
            this.launchController(this.footer);
        }
        window.onload = e => {
            const location = window.location;
            const path = location.pathname;
            const data = parseQuery(location.search);
            this.action(path, data);
        };
        window.onpopstate = e => {
            this.changed(e.state);
        };
    }
    action(path, data) {
        let pathValues = path.substr(1).split('/');
        let route = pathValues[0];

        let state = {name: route, prop: pathValues[1], data};
        if (route) {
            window.history.pushState(state, this.routes[Object.keys(this.routes).find(route => route.startsWith(state.name))]["name"], path);
        }
        this.changed(state);
    }
    changed(state) {
        try {
            if (state) {
                this.loadRouteTemplate(state);
            } else {
                for (const routeKey in this.routes) {
                    let route = this.routes[routeKey];
                    if (route["root"]) {
                        this.loadRouteTemplate(state);
                        break;
                    }
                }
            }
        } catch (e) {
            console.error(`No such route ${state ? state.name : undefined}/${state.data}, error: ${e}`);
        }
    }
    loadRouteTemplate(state) {
        let route = Object.keys(this.routes).find(route => route.startsWith(state.name));
        // if (state && route && state.prop) {
        let controller = this.routes[route]["controller"];
        if (state.prop) {
            let colIndex = route.indexOf(':');
            if (colIndex != -1) {
                let propName = route.substring(colIndex+1);
                controller.props = {
                    [propName]: state.prop
                };
            }
        }
        document.title = this.routes[route]['name'];
        if (this.routes[route]['needAuth'] == true) {
            this.launchControllerWithAuthCheck(controller);
        } else {
            this.launchController(controller);
        }
    }

    launchControllerWithAuthCheck(controller) {
        firebase.auth().onAuthStateChanged(user => {
            if (user != null) {
                this.launchController(controller);            
            } else {
                this.action("/auth");
            }
        });
    }

    launchController(controller) {
        controller.renderPage();
        if (isFunction(controller["vlOnInit"])) {
            // Imitating ngOnInit cause there's no any dependency injection
            controller["vlOnInit"]();
        }
    }
}