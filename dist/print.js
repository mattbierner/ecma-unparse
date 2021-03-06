/*
 * THIS FILE IS AUTO GENERATED FROM 'lib/print.kep'
 * DO NOT EDIT
*/
define(["require", "exports", "nu-stream/stream", "./beautify"], (function(require, exports, __o, js_beautify) {
    "use strict";
    var foldl = __o["foldl"],
        map = __o["map"],
        print, join = foldl.bind(null, (function(x, y) {
            return (x + y);
        }), ""),
        mapTokens = map.bind(null, (function(x) {
            if ((!x)) return "";
            switch (x.type) {
                case "Null":
                    return "null";
                case "Comment":
                    return (("/*" + x.value) + "*/");
                case "String":
                    return JSON.stringify(x.value)
                        .replace("\u2028", "\\u2028")
                        .replace("\u2029", "\\u2029");
                default:
                    return x.value;
            }
        })),
        options = ({
            "preserve_newlines": false,
            "wrap_line_length": 120,
            "break_chained_methods": true
        }),
        beautify = (js_beautify.js_beautify || js_beautify);
    (print = (function(f, g) {
        return (function(x) {
            return f(g(x));
        });
    })((function(f, g) {
        return (function(x) {
            return f(g(x));
        });
    })((function(x) {
        return beautify(x, options);
    }), join), mapTokens));
    (exports["print"] = print);
}));