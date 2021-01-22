function parseQuery(query) {
    let variables = query.substring(1).split('&');
    var result = {};
    variables.forEach(element => {
        let pair = element.split('=');
        result[pair[0]] = pair[1];
    });
    return result;
}