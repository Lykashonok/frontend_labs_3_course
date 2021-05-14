import { useBindingEngine, useTemplateEngine } from "./vlModule.js";

export class BaseController {
    templates_dir = '/public/';
    templates = {
        index: 'index.html'
    };
    target = null; // target element to put parsed html page
    name = '';

    constructor(controllerFolder) {
        this.name = controllerFolder;
    }

    index(data) {
        let pageData = new PageData(this.templates.index, data);
        // do smth in action (loading etc.)
        return pageData;
    }

    render(action, data) {
        let pageData = this[action](data);
        // actions before page rendering;
        this.renderPage(pageData);
    }

    renderPage(pageData) {
        console.log(pageData);
        let url = this.templates_dir + this.name + '/' +  pageData.template;
        // loading page via xmlhttprequest
        let templateLoader = new XMLHttpRequest;
        templateLoader.onreadystatechange = (e) => {
            if (e.target.readyState === 4 && e.target.status === 200) {
                let parsed_html = useTemplateEngine(this, e.target.responseText, pageData.data);
                this.target.innerHTML = parsed_html;
                useBindingEngine(this, this.target);
            }
        }
        templateLoader.open("GET", url, true);
        templateLoader.send();
    }

    some_variable = 2;

    testFunction(a) {
        console.log("qwer");
        console.log(a);
        return 2;
    }

    updateTemplates(newTemplates) {
        this.templates = {
            ...this.templates,
            ...newTemplates
        };
    }
}

export class PageData {
    data = {};
    template = "";
    constructor(template, data) {
        this.data = data; this.template = template;
    }
}