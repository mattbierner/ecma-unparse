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
            return (x.value.indexOf('"') !== -1 ?
                "'" + x.value + "'" :
                '"' + x.value + '"');
        default:
            return x.value;
        }
    };
    
    return function(s) {
        return stream.map(s, mapper);
    };
}());

return {
    'print': print
};

});