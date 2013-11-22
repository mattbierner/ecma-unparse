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
            return JSON.stringify(x.value)
                .replace('\u2028', '\\u2028')
                .replace('\u2029', '\\u2029');
        default:
            return x.value;
        }
    };
    
    return function(s) {
        return beautify(
            stream.foldl(
                function(p, c) { return p + c; },
                '',
                stream.map(mapper, s)),
            {
                'preserve_newlines': false,
                "wrap_line_length": 120,
                "break_chained_methods": true
            });
    };
}());

return {
    'print': print
};

});