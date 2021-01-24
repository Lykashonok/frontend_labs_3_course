import { BaseController, PageData } from "./BaseController.js";
export class HomeController extends BaseController {
    constructor(controllerFolder){
        super(controllerFolder);
        this.updateTemplates({
            test: "test.html"
        });
    }
    test(data) {
        let pageData = new PageData(this.templates.test, data);

        return pageData;
    }
}