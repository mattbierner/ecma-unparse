define(['nu/stream', 'ecma_unparse/beautify'],
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
            return JSON.stringify(x.value);
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