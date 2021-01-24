const app_id = "app";
const header_id = "header";
const footer_id = "footer";

function Router(routes) {
    this.constructor(routes);
    this.init();
}

Router.prototype = {
    routes: [],
    app: null,
    header: null,
    footer: null,
    templates_dir: '/templates/',
    constructor: function (routes) {
        this.routes = routes;
        this.app = document.getElementById(app_id);
        this.header = document.getElementById(header_id);
        this.footer = document.getElementById(footer_id);
    },
    init: function () {
        window.addEventListener('hashchange', e => this.changed());
        window.onpopstate = (e) => {
            if (e.state) {
                
            }
        };
        this.changed();
    },
    changed: function () {
        let path = window.location.pathname.substr(1).split('/');
        let query = parseQuery(window.location.search);
        let routeName = window.location.hash.replace("#", "").trim();
        history.pushState({page: this.routes[routeName].name}, this.routes[routeName].name, this.routes[routeName].name);

        try {
            if (routeName) {
                this.loadRouteTemplate(this.routes[routeName].name, this.routes[routeName].template);
            } else {
                for (const routeKey in this.routes) {
                    let route = this.routes[routeKey];
                    if (route["root"]) {
                        this.loadRouteTemplate(route["name"], route["template"]);
                        break;
                    }
                }
            }
        } catch (e) {
            console.error(`No such route with name ${routeName}, error: ${e}`);
        }
    },
    loadRouteTemplate: function (name, template) {
        let url = this.templates_dir + template;
        let templateLoader = new XMLHttpRequest;
        var app = this.app;
        templateLoader.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                document.title = name;
                app.innerHTML = this.responseText;
            }
        }
        templateLoader.open("GET", url, true);
        templateLoader.send();
    }
}