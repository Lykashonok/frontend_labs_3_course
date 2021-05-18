import { parseFunction, isFunction } from "./funcs.js";

// Context is our controller
export function useBindingEngine(context, target) {
    // Setting vlModule for element
    for (const element of target.querySelectorAll(`[\\[${bind_attribute}\\]]`)) {
        let propName = element.getAttribute(`[${bind_attribute}]`);
        twoWayBinding(context, propName, element);
    }

    // Setting vlShow
    vlShowBind(target, context);


    // Setting vlSubmit for <form> only
    for (const element of target.querySelectorAll(`[\\[${submit_attribute}\\]]`)) {
        if (element.tagName != 'FORM') {
            throw `Cannot apply ${submit_attribute} to not <form></form>`;
        }
        let prop = element.getAttribute(`[${submit_attribute}]`);
        element.addEventListener("submit", (event) => {
            event.preventDefault();
            getVariable(context, prop, context, true);
            return false;
        });
    }

    // Setting vlFor
    for (const element of target.querySelectorAll(`[\\*${for_attribute}]`)) {
        let prop = element.getAttribute(`*${for_attribute}`);
        let keys = prop.trim().split(' ');
        let container = element.parentNode;
        let elements = [];

        // let item of array
        // keys[0] must be let, keys[1] must be var, keys[2] must be of, kyes[3] must be arr
        let array = getVariable(context, keys[3], context);
        if (keys.length != 4) {
            throw "invalid vlFor";
        }

        Object.defineProperty(context, keys[3], {
            get: () => array,
            set: (newArray) => { // Where variable updated
                // Removing all old elements
                for (const innerElement of elements) {
                    innerElement.parentNode.removeChild(innerElement);
                }
                elements = [];

                array = newArray;
                
                let populate = item => {
                    let itemElement = element.cloneNode(true);
                    let itemContext = {[keys[1]] : item};
                    itemElement.innerHTML = useTemplateEngine(itemContext, itemElement.innerHTML);
                    itemElement.setAttribute("class", useTemplateEngine(itemContext, itemElement.getAttribute("class")));
                    // Setting vlIf and vlClick for inner elements according context is outer context
                    vlShowBind(itemElement, context);
                    vlClickBind(itemElement, context);
                    container.appendChild(itemElement);
                    elements.push(itemElement)
                }

                // Filling new elements
                if (array instanceof Object) {
                    for (const key in array) {
                        populate(array[key]);
                    }
                } else if (array instanceof Array) {
                    for (const item of array) {
                        populate(item);
                    }
                }
            },
            configurable: true
        });

        // setting array for immediate filling dom element
        context[keys[3]] = array;

        // remove element with [vlFor]="let item of items"
        element.parentNode.removeChild(element);
    }

    vlClickBind(target, context);
}

function vlClickBind(target, context) {
    // Setting vlClick for element
    for (const element of target.querySelectorAll(`[\\[${click_attribute}\\]]`)) {
        let prop = element.getAttribute(`[${click_attribute}]`);
        element.addEventListener("click", event => {
            // Just try to execute function with arguments
            getVariable(context, prop, context, true, event);
        })
    }
}

function vlShowBind(target, context) {
    for (let element of target.querySelectorAll(`[\\[${show_attribute}\\]]`)) {
        let prop = element.getAttribute(`[${show_attribute}]`).replace(' ', '');
        element['inverted'] = prop.indexOf('!') == 0;
        prop = prop.replace('!', '');

        let value = context[prop];
        let bindedProp = "binded_show_to_" + prop;
        if (!Array.isArray(context[bindedProp])) {
            context[bindedProp] = [element];
        } else {
            context[bindedProp].push(element);
        }
        // if (context[prop] == undefined) {
            Object.defineProperty(context, prop, {
                get: () => value,
                set: newValue => {
                    value = newValue;
                    for(let element of context[bindedProp]) {
                        if (element['inverted'] ? !newValue : newValue) {
                            element.classList.remove("hidden");
                        } else {
                            element.classList.add("hidden");
                        }
                    }
                },
                configurable: true
            });
        // }
        context[prop] = value;
    }
}

function twoWayBinding(context, propName, element) {
    let bindedProp = "binded_show_to_" + propName;
    if (!Array.isArray(context[bindedProp])) {
        context[bindedProp] = [element];
    } else {
        context[bindedProp].push(element);
    }
    Object.defineProperty(context, propName, {
        get: () => element.value ? element.value : element.innerHTML,
        set: (newValue) => {
            for(let element of context[bindedProp]) {
                if (element.nodeName === 'INPUT' || element.nodeName === 'SELECT') {
                    element.value = (typeof newValue !== 'undefined' ? newValue : '');
                } else {
                    element.innerHTML = newValue;
                }
            }
        },
        configurable: true
    });
    if (element.nodeName === 'INPUT') {
        element.onkeyup = e => {
            context[propName] = e.target.value;
        }
        element.value = context[propName]
    } else if (element.nodeName === 'SELECT') {
        element.onchange = e => {
            context[propName] = e.target.value;
        }
        if (element.hasChildNodes()){
            element.selectedIndex = 0;
            element.dispatchEvent(new Event('change'));
        }
    }
}

export const bind_attribute     = 'vlModel';
export const click_attribute    = 'vlClick';
export const for_attribute      = 'vlFor';
export const submit_attribute   = 'vlSubmit';
export const show_attribute     = 'vlShow';

export function useTemplateEngine(controller, template, data) {
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
        if (item.substr(0, 2) == "{{" && item.substr(-2, 2) == "}}") {
            let parsedItem = '';
            let currentItem = item.substring(2, item.length - 2).trim().replace(" ", '').split('.');
            try {
                parsedItem = parseVariable(controller, currentItem, controller);
            } catch (e) {
                parsedItem = undefined;
                console.error(e);
            }
            parsed += parsedItem;
        } else {
            parsed += item;
        }
    }
    return parsed;
}

function parseVariable(controller, item, dataPart) {
    if (item[0] == undefined) {
        return dataPart;
    } else {
        let tmp = getVariable(controller, item[0], dataPart);
        item.shift();
        if (item.length == 0) {
            return tmp;
        }
        return parseVariable(controller, item, tmp);
    }
}

function getVariable(controller, variable, dataPart, execute=false, event=null) {
    let isVariableFunction = /\((.*?)\)/.exec(variable);
    if (variable && isVariableFunction && isVariableFunction.length != 0) {
        // it's function
        let functionName = variable.substr(0, variable.indexOf('('));
        let functionVariables = variable.substring(variable.indexOf('(') + 1, variable.lastIndexOf(')')).split(',');
        // if (isFunction(dataPart[functionName])) {
        //     // in data there's no function, try find in controller
        //     return parseFunction(variable);
        // } else 
        if (isFunction(controller[functionName])) {
            // found function in controller
            let variablesToFunction = [];
            functionVariables.forEach(variable => {
                let currentVariable = variable.trim().replace(" ", '').split('.');
                variablesToFunction.push(parseVariable(controller, currentVariable, dataPart))
            });
            if (execute) {
                if (variablesToFunction.indexOf('event') != -1) {
                    variablesToFunction.shift();
                    variablesToFunction.unshift(event); // If there's event, pass it as a value to function
                }
                controller[functionName].apply(controller, variablesToFunction); // Run it
            }
            return { function: controller[functionName], arguments: variablesToFunction };
        } else {
            throw `there's no function ${variable} in controller`;
        }
    } else {
        // it's variable
        if (dataPart[variable] != undefined && dataPart[variable] != null) {
            return dataPart[variable];
        }
        let descriptor = Object.getOwnPropertyDescriptor(controller, variable);
        if (descriptor && descriptor.get != undefined) {
            return descriptor.get();
        }
        return variable;
    }
}