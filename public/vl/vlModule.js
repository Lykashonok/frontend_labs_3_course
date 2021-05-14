import { parseFunction, isFunction } from "./funcs.js";

export function useBindingEngine(context, target) {
    for (const element of target.querySelectorAll(`[${bind_attribute}]`)) {
        let propName = getBindedAttributeName(element);
        Object.defineProperty(context, propName, {
            get: () => {
                console.log("value get");
            },
            set: (value) => {
                if (element.nodeName === 'INPUT') {
                    element.value = (typeof value !== 'undefined' ? value : '');
                }
                else {
                    element.innerHTML = value;
                }
            },
            configurable: true
        });
        if (element.nodeName === 'INPUT') {
            element.onkeyup = (e) => {
                let propName = getBindedAttributeName(e.target);
                context[propName] = e.target.value;
            }
        }
    }
}

export const bind_attribute = 'vlModel';

function getBindedAttributeName(element) {
    return "binded_" + element.getAttribute(bind_attribute);
}

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
        if (item.substr(0,2) == "{{" && item.substr(-2,2) == "}}") {
            let parsedItem = '';
            let currentItem = item.substring(2, item.length - 2).trim().replace(" ", '').split('.');
            try {    
                let tmp = getVariable(controller, currentItem[0], data);
                currentItem.shift();
                parsedItem = parseVariable(controller, currentItem, data[tmp]);
            } catch(e) {
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
        return parseVariable(controller, item, dataPart[tmp]);
    }
}

function getVariable(controller, variable, dataPart) {
    let isVariableFunction = /\((.*?)\)/.exec(variable);
    if (variable && isVariableFunction && isVariableFunction.length != 0) {
        // it's function
        let functionName = variable.substr(0, variable.indexOf('('));
        let functionVariables = variable.substring(variable.indexOf('(') + 1, variable.lastIndexOf(')')).split(',');
        console.log(functionName)
        if(isFunction(dataPart[functionName])) {
            // in data there's no function, try find in controller
            return parseFunction(variable);
        } else if(isFunction(controller[functionName])) {
            // found function in controller
            let variablesToFunction = [];
            functionVariables.forEach(variable => {
                let currentVariable = variable.trim().replace(" ", '').split('.');
                variablesToFunction.push(parseVariable(controller, currentVariable, dataPart))
            });
            return controller[functionName].apply(variablesToFunction);
        } else {
            throw `there's no function ${varibale} in controller`;
        }
    } else {
        // it's variable
        return variable;
    }
}