import { useBindingEngine, useTemplateEngine } from "./vlModule.js";

export class BaseController {
    template = '';
    styles = [];
    target = null; // target element to put parsed html page
    style_prefix = '';
    name = '';

    constructor(controllerTemplate, controllerStyles = []) {
        this.template = controllerTemplate;
        this.styles = controllerStyles;
    }

    navigate(event, path) {
        if (event != null)
            event.preventDefault();
        window.router.action(path);
    }

    renderPage(pageData) {
        let url = this.template;
        // loading page via xmlhttprequest
        let templateLoader = new XMLHttpRequest;
        templateLoader.onreadystatechange = (e) => {
            if (e.target.readyState === 4 && e.target.status === 200) {
                this.target.innerHTML = e.target.responseText;
                useBindingEngine(this, this.target);
                // let parsed_html = useTemplateEngine(this, this.target.innerHTML, pageData.data);
                // this.target.innerHTML = parsed_html;
            }
        }
        
        let head  = document.getElementsByTagName('head')[0];
        // Clearing old styles of current controller
        for (const oldStyle of document.querySelectorAll('[vlCss]')) {
            oldStyle.parentNode.removeChild(oldStyle);
        }

        // Filling new styles of current controller
        for (const style of this.styles) {
            var link  = document.createElement('link');
            link.rel  = 'stylesheet';
            link.type = 'text/css';
            link.href = style;
            link.setAttribute(this.style_prefix + 'vlCss', "true")
            link.media = 'all';
            head.appendChild(link);
        }

        templateLoader.open("GET", url, false);
        templateLoader.send();
    }
}

export class PageData {
    data = {};
    template = "";
    constructor(template, data) {
        this.data = data; this.template = template;
    }
}