let initRoutes = () => {

    var router = new Router({
        "home" : {name: "Home", template: "home.html", root: true},
        "about" : {name: "About", template: "about.html", root: false}
    });
}
initRoutes();