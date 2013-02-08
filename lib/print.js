define(['stream/stream'],
function(stream){

var print = function(s) {
    return stream.map(s, function(x) {
        if (!x) {
            return '';
        }
        switch (x.type) {
        case 'Comment':
            return "/*" + x.value + "*/";
        case 'String':
            return (x.value.indexOf('"') !== -1 ?
                "'" + x.value + "'" :
                '"' + x.value + '"');
        default:
            return x.value;
        }
    });
};

return {
    'print': print
};

});