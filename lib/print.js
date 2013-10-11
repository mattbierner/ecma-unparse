define(['nu/stream', 'beautify'],
function(stream, beautify){

/**
 * Transforms a stream of tokens to strings.
 */
var print = (function(){
    var mapper = function(x) {
        if (!x)
            return '';
        
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
        return beautify(
            stream.foldl(
                function(p, c) { return p + c; },
                '',
                stream.map(mapper, s)));
    };
}());

return {
    'print': print
};

});