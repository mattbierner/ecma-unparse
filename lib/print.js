define(['nu/stream'],
function(stream){

/**
 * Transforms a stream of tokens to a stream of strings.
 */
var print = (function(){
    var mapper = function(x) {
        if (!x) {
            return '';
        }
        switch (x.type) {
        case 'Null':
            return 'null';
        case 'Comment':
            return "/*" + x.value + "*/";
        case 'String':
            var value = x.value.replace('\\', '\\\\');
            return (x.value.indexOf('"') !== -1 ?
                "'" + value + "'" :
                '"' + value + '"');
        default:
            return x.value;
        }
    };
    
    return function(s) {
        return stream.map(mapper, s);
    };
}());

return {
    'print': print
};

});