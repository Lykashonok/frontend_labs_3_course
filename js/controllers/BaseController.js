export class BaseController {
    templates_dir = '/templates/';
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
        let url = this.templates_dir + this.name + '/' +  pageData.template;
        let templateLoader = new XMLHttpRequest;
        templateLoader.onreadystatechange = (e) => {
            if (e.target.readyState === 4 && e.target.status === 200) {
                // console.log(pageData.data);
                this.target.innerHTML = this.useTemplateEngine(e.target.responseText, pageData.data);
            }
        }
        templateLoader.open("GET", url, true);
        templateLoader.send();
    }

    useTemplateEngine(template, data) {

        let result = /{{(.*?)}}/g.exec(template);
        const arr = [];
        let firstPos;

        while (result) {
            firstPos = result.index;
            if (firstPos !== 0) {
                arr.push(template.substring(0, firstPos));
                template = template.slice(firstPos);
            }

            arr.push(result[0]);
            template = template.slice(result[0].length);
            result = /{{(.*?)}}/g.exec(template);
        }

        if (template) arr.push(template);
        let parsed = "";
        for (let item of arr) {
            if (item.substr(0,2) == "{{" && item.substr(-2,2) == "}}") {
                let parsedItem = '';
                item = item.substring(2, item.length - 2).trim().replace(" ", '').split('.');
                try {
                    parsedItem = data[item[0]];
                    item.shift();
                    while(item.length >= 1) {
                        parsedItem = parsedItem[item[0]];
                        item.shift();
                    }
                } catch(e) {
                    parsedItem = "";
                }
                item = parsedItem;
            }
            parsed += item;
        }
        return parsed;
    }

    updateTemplates(newTemplates) {
        this.templates = {
            ...this.templates,
            ...newTemplates
        }
    }
}

export class PageData {
    data = {};
    template = "";
    constructor(template, data) {
        this.data = data; this.template = template;
    }
}