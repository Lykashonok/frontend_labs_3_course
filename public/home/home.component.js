import { BaseController, PageData } from "./../vl/BaseController.js";

export class HomeController extends BaseController {
    constructor(controllerFolder){
        super(controllerFolder);
        this.updateTemplates({
            test: "test.html"
        });
    }
    
    test(data) {
        // data = object from query. 
        let pageData = new PageData(this.templates.test, {
            foo : data["foo"]
        });

        return pageData;
    }
}