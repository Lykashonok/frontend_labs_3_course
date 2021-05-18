export function parseQuery(query) {
    let variables = query.substring(1).split('&');
    var result = {};
    variables.forEach(element => {
        let pair = element.split('=');
        result[pair[0]] = pair[1];
    });
    return result;
}

export function isFunction(functionToCheck) {
    let functionRepresentation = functionToCheck && {}.toString.call(functionToCheck);
    return functionRepresentation === '[object Function]' || functionRepresentation === '[object AsyncFunction]';
}

export function parseFunction (str) {
    var fn_body_idx = str.indexOf('{'),
        fn_body = str.substring(fn_body_idx+1, str.lastIndexOf('}')),
        fn_declare = str.substring(0, fn_body_idx),
        fn_params = fn_declare.substring(fn_declare.indexOf('(')+1, fn_declare.lastIndexOf(')')),
        args = fn_params.split(',');
  
    args.push(fn_body);
  
    function Fn () {
      return Function.apply(this, args);
    }
    Fn.prototype = Function.prototype;
      
    return new Fn();
}

export function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}