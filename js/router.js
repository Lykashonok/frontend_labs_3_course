const app_id = "app";
const header_id = "header";
const footer_id = "footer";

/*
    state = {
        name: "route_name",
        action: "route_action",
        data: {}
    }
*/

class Router {
    routes = [];
    header = null;
    footer = null;
    constructor(routes) {
        this.routes = routes;
        for (const route in this.routes) {
            this.routes[route]["controller"].target = document.getElementById(app_id);
        }
    }
    init() {
        window.onpopstate = e => this.changed(e.state);
        this.changed(history.state);
    }
    action(path, data) {
        let pathValues = path.substr(1).split('/');
        if (pathValues[0]) {
            let state = {name: pathValues[0], action: pathValues[1], data};
            window.history.pushState(state, this.routes[pathValues[0]]["name"], path);
            this.changed(state);
        }
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
            console.error(`No such route with name ${state ? state.name : undefined} and method ${state.action}, error: ${e}`);
        }
    }
    loadRouteTemplate(state) {
        if (state && state.name && state.action) {
            let controller = this.routes[state.name]["controller"];
            let action = state.action;
            if(state.action && isFunction(controller[action])) {
                controller.render(action, state.data);
            } else {
                throw `${state.name}.${action} is not a fuction`;
            }
        } else if (state && state.name && !state.action) {
            this.routes[state.name]["controller"].render("index", state.data);
        } else {
            this.routes["home"]["controller"].render("index", {});
        }
    }
}