import { BaseController, PageData } from "../vl/BaseController.js";

export class FooterController extends BaseController {
    // to prevent from clearing css on navigation to new controller
    style_prefix = 'footer_';
}
