"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useBindingEngine = useBindingEngine;
exports.useTemplateEngine = useTemplateEngine;
exports.if_attribute = exports.submit_attribute = exports.for_attribute = exports.click_attribute = exports.bind_attribute = void 0;

var _funcs = require("./funcs.js");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Context is our controller
function useBindingEngine(context, target) {
  // Setting vlModule for element
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = target.querySelectorAll("[\\[".concat(bind_attribute, "\\]]"))[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var element = _step.value;
      var propName = getBindedAttributeName(element);
      twoWayBinding(context, propName, element);
    } // Setting vlIf

  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  vlIfBind(target, context); // Setting vlSubmit for <form> only

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    var _loop = function _loop() {
      var element = _step2.value;

      if (element.tagName != 'FORM') {
        throw "Cannot apply ".concat(submit_attribute, " to not <form></form>");
      }

      var prop = element.getAttribute("[".concat(submit_attribute, "]"));
      element.addEventListener("submit", function (event) {
        event.preventDefault();
        getVariable(context, prop, context, true);
        return false;
      });
    };

    for (var _iterator2 = target.querySelectorAll("[\\[".concat(submit_attribute, "\\]]"))[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      _loop();
    } // Setting vlFor

  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    var _loop2 = function _loop2() {
      var element = _step3.value;
      var prop = element.getAttribute("*".concat(for_attribute));
      var keys = prop.trim().split(' ');
      var container = element.parentNode;
      var elements = []; // let item of array
      // keys[0] must be let, keys[1] must be var, keys[2] must be of, kyes[3] must be arr

      var array = getVariable(context, keys[3], context);

      if (keys.length != 4) {
        throw "invalid vlFor";
      }

      Object.defineProperty(context, keys[3], {
        get: function get() {
          return array;
        },
        set: function set(newArray) {
          // Where variable updated
          // Removing all old elements
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = elements[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var innerElement = _step4.value;
              innerElement.parentNode.removeChild(innerElement);
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          elements = [];
          array = newArray;

          var populate = function populate(item) {
            var itemElement = element.cloneNode(true);

            var itemContext = _defineProperty({}, keys[1], item);

            itemElement.innerHTML = useTemplateEngine(itemContext, itemElement.innerHTML); // Setting vlIf and vlClick for inner elements according context is outer context

            vlIfBind(itemElement, context);
            vlClickBind(itemElement, context);
            container.appendChild(itemElement);
            elements.push(itemElement);
          }; // Filling new elements


          if (array instanceof Object) {
            for (var key in array) {
              populate(array[key]);
            }
          } else if (array instanceof Array) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              for (var _iterator5 = array[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var item = _step5.value;
                populate(item);
              }
            } catch (err) {
              _didIteratorError5 = true;
              _iteratorError5 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                  _iterator5["return"]();
                }
              } finally {
                if (_didIteratorError5) {
                  throw _iteratorError5;
                }
              }
            }
          }
        },
        configurable: true
      }); // setting array for immediate filling dom element

      context[keys[3]] = array; // remove element with [vlFor]="let item of items"

      element.parentNode.removeChild(element);
    };

    for (var _iterator3 = target.querySelectorAll("[\\*".concat(for_attribute, "]"))[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      _loop2();
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
        _iterator3["return"]();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  vlClickBind(target, context);
}

function vlClickBind(target, context) {
  // Setting vlClick for element
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    var _loop3 = function _loop3() {
      var element = _step6.value;
      var prop = element.getAttribute("[".concat(click_attribute, "]"));
      element.addEventListener("click", function (event) {
        // Just try to execute function with arguments
        getVariable(context, prop, context, true, event);
      });
    };

    for (var _iterator6 = target.querySelectorAll("[\\[".concat(click_attribute, "\\]]"))[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      _loop3();
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
        _iterator6["return"]();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }
}

function vlIfBind(target, context) {
  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    var _loop4 = function _loop4() {
      var element = _step7.value;
      var prop = element.getAttribute("*".concat(if_attribute));
      Object.defineProperty(context, prop, {
        get: function get() {},
        set: function set(value) {
          if (value) {
            element.parentNode.appendChild(element);
          } else {
            element.parentNode.removeChild(element);
          }
        },
        configurable: true
      });
    };

    for (var _iterator7 = target.querySelectorAll("[\\*".concat(if_attribute, "]"))[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      _loop4();
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
        _iterator7["return"]();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }
}

function twoWayBinding(context, propName, element) {
  Object.defineProperty(context, propName, {
    get: function get() {
      return element.value;
    },
    set: function set(value) {
      if (element.nodeName === 'INPUT') {
        element.value = typeof value !== 'undefined' ? value : '';
      } else {
        element.innerHTML = value;
      }
    },
    configurable: true
  });

  if (element.nodeName === 'INPUT') {
    element.onkeyup = function (e) {
      var propName = getBindedAttributeName(e.target);
      context[propName] = e.target.value;
    };
  }
}

var bind_attribute = 'vlModel';
exports.bind_attribute = bind_attribute;
var click_attribute = 'vlClick';
exports.click_attribute = click_attribute;
var for_attribute = 'vlFor';
exports.for_attribute = for_attribute;
var submit_attribute = 'vlSubmit';
exports.submit_attribute = submit_attribute;
var if_attribute = 'vlIf';
exports.if_attribute = if_attribute;

function getBindedAttributeName(element) {
  return "" + element.getAttribute("[".concat(bind_attribute, "]"));
}

function useTemplateEngine(controller, template, data) {
  var result = /{{(.*?)}}/g.exec(template);
  var arr = [];
  var firstPos;

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
  var parsed = "";

  for (var _i = 0, _arr = arr; _i < _arr.length; _i++) {
    var item = _arr[_i];

    if (item.substr(0, 2) == "{{" && item.substr(-2, 2) == "}}") {
      var parsedItem = '';
      var currentItem = item.substring(2, item.length - 2).trim().replace(" ", '').split('.');

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
    var tmp = getVariable(controller, item[0], dataPart);
    item.shift();

    if (item.length == 0) {
      return tmp;
    }

    return parseVariable(controller, item, tmp);
  }
}

function getVariable(controller, variable, dataPart) {
  var execute = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var event = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
  var isVariableFunction = /\((.*?)\)/.exec(variable);

  if (variable && isVariableFunction && isVariableFunction.length != 0) {
    // it's function
    var functionName = variable.substr(0, variable.indexOf('('));
    var functionVariables = variable.substring(variable.indexOf('(') + 1, variable.lastIndexOf(')')).split(','); // if (isFunction(dataPart[functionName])) {
    //     // in data there's no function, try find in controller
    //     return parseFunction(variable);
    // } else 

    if ((0, _funcs.isFunction)(controller[functionName])) {
      // found function in controller
      var variablesToFunction = [];
      functionVariables.forEach(function (variable) {
        var currentVariable = variable.trim().replace(" ", '').split('.');
        variablesToFunction.push(parseVariable(controller, currentVariable, dataPart));
      });

      if (execute) {
        if (variablesToFunction.indexOf('event') != -1) {
          variablesToFunction.shift();
          variablesToFunction.unshift(event); // If there's event, pass it as a value to function
        }

        controller[functionName].apply(controller, variablesToFunction); // Run it
      }

      return {
        "function": controller[functionName],
        arguments: variablesToFunction
      };
    } else {
      throw "there's no function ".concat(variable, " in controller");
    }
  } else {
    // it's variable
    if (dataPart[variable] != undefined && dataPart[variable] != null) {
      return dataPart[variable];
    }

    var descriptor = Object.getOwnPropertyDescriptor(controller, variable);

    if (descriptor && descriptor.get != undefined) {
      return descriptor.get();
    }

    return variable;
  }
}