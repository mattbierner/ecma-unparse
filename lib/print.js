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
            var value = x.value
                .replace('\\', '\\\\')
                .replace('\n', '\\n')
                .replace('\'', '\\\'')
                .replace('\u0008', '\\u0008')
                .replace('\u000C', '\\u000C')
                .replace('\u000A', '\\u000A')
                .replace('\u000D', '\\u000D')
                .replace('\u0009', '\\u0009')
                .replace('\u000B', '\\u000B')
                .replace('\u2028', '\\u2028')
                .replace('\u2029', '\\u2029');
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