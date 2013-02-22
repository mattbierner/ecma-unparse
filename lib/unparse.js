/**
 * @fileOverview Transforming an AST into a stream of tokens.
 */
define(['stream/stream', 'stream/gen',
        'ecma/lex/token',
        'ecma/ast/node',
        'ecma/position'],
function(stream, gen,
        token,
        node,
        position){

/* Prototypes
 ******************************************************************************/
var slice = Array.prototype.slice;

/* Forward Declarations
 ******************************************************************************/
var _unparse;

/* Stream Utilities
 ******************************************************************************/
/**
 * Joins an array of objects into a stream with a given joiner object.
 */
var join = function(arr, joiner) {
    if (arr.length === 0) {
        return stream.end;
    } else if (arr.length === 1) {
        return arr[0];
    } else {
        return stream.concat(arr[0], stream.cons(joiner, join(arr.slice(1), joiner)));
    }
};

/**
 * Joins an array of objects into a stream with a stream joiner object.
 */
var joins = function(arr, joiner) {
    if (arr.length === 0) {
        return stream.end;
    } else if (arr.length === 1) {
        return arr[0];
    } else {
        return stream.concat(arr[0], stream.concat(joiner, joins(arr.slice(1), joiner)));
    }
};

/* Token
 ******************************************************************************/
var keyword = function(x) {
    return new token.KeywordToken(null, x);
};

var lineTerminator = function(x) {
    return new token.LineTerminatorToken(null, x);
};

var punctuator = function(x) {
    return new token.PunctuatorToken(null, x);
};

var whitespace = function(x) {
    return new token.WhitespaceToken(null, x);
};

/* Unparsing
 ******************************************************************************/
var sseq = function(/*...*/) {
    if (arguments.length === 0) {
        return stream.end;
    }
    var first = arguments[0],
        rest = sseq.apply(undefined, slice.call(arguments, 1));

    if (stream.isEmpty(first)) {
        return rest;
    }
    
    if (first === undefined) {
        return rest;
    }
    
    if (first instanceof token.Token) {
        return stream.cons(first, rest)
    } else if (first instanceof node.Node) {
        return stream.concat(_unparse(first), rest)
    } else if (Array.isArray(first)) {
        return stream.concat(stream.concata.apply(undefined, first.map(_unparse)), rest)
    } else if (stream.isStream(first)) {
        return stream.concat(first, rest);
    } else {
        return stream.cons(first, rest)
    }
};

/**
 * Transforms a AST node to a stream of tokens.
 */
_unparse = function(node) {
    if (!node) {
        return stream.end;
    }
        
    switch (node.type) {
// clauses
    case 'SwitchCase':
        return sseq(
            keyword('case'),
            _unparse(node.test),
            punctuator(':'),
            node.consequent);
   
    case 'CatchClause':
        return sseq(
            keyword('catch'),
            punctuator('('),
            node.param,
            punctuator(')'),
            node.body);
    
// Statement
    case 'EmptyStatement':
        return sseq(
            punctuator(';'));
        
    case 'DebuggerStatement':
        return sseq(
            keyword('debugger'),
            punctuator(';'));
    
    case 'BlockStatement':
        return sseq(
            punctuator('{'),
            lineTerminator('\n'),
            node.body,
            punctuator('}'),
            lineTerminator('\n'));
        
    case 'ExpressionStatement':
        return sseq(
            node.expression,
            punctuator(';'),
            lineTerminator('\n'));
    
    case 'IfStatement':
        return sseq(
            keyword('if'),
            whitespace(' '),
            punctuator('('),
            node.test,
            punctuator(')'),
            node.consequent,
            (!node.alternate ? stream.end :
                sseq(
                    keyword('else'),
                    whitespace(' '),
                    node.alternate)));
        
    case 'LabeledStatement':
        return sseq(
            new token.IdentifierToken(null, node.label),
            punctuator(';'),
            node.body);
        
    case 'BreakStatement':
        return sseq(
            keyword('break'),
            whitespace(' '),
            node.identifier,
            punctuator(';'));
        
    case 'ContinueStatement':
        return sseq(
            keyword('continue'),
            whitespace(' '),
            node.identifier,
            punctuator(';'));
        
    case 'WithStatement':
        return sseq(
            keyword('with'),
            punctuator('('),
            node.object,
            punctuator(')'),
            punctuator('{'),
            node.body,
            punctuator('}'));
        
    case 'SwitchStatement':
        return sseq(
            keyword('switch'),
            punctuator('('),
            node.discriminant,
            punctuator(')'),
            punctuator('{'),
            node.cases,
            punctuator('}'));
    
    case'ReturnStatement':
        return sseq(
            keyword('return'),
            whitespace(' '),
            node.argument,
            punctuator(';'),
            lineTerminator('\n'));
    
    case 'ThrowStatement':
        return sseq(
            keyword('throw'),
            whitespace(' '),
            node.argument,
            punctuator(';'));
    
    case 'TryStatement':
        return sseq(
            keyword('try'),
            node.block,
            node.handler,
            (node.finalizer ?
                sseq(
                    keyword('finally'),
                    node.finalizer) :
                stream.end));
    
    case 'WhileStatement':
        return sseq(
            keyword('while'),
            punctuator('('),
            node.test,
            punctuator(')'),
            node.body);
        
    case 'DoWhileStatement':
        return sseq(
            keyword('do'),
            node.body,
            keyword('while'),
            punctuator('('),
            node.test,
            punctuator(')'),
            punctuator(';'));
    
    case 'ForStatement':
        return sseq(
            keyword('for'),
            punctuator('('),
            node.init,
            (node.init.type === "VariableDeclaration" ? whitespace(' ') : punctuator(';')),
            node.test,
            punctuator(';'),
            node.update,
            punctuator(')'),
            node.body);
        
    case 'ForInStatement':
        return sseq(
            keyword('for'),
            punctuator('('),
            node.left,
            punctuator('in'),
            node.right,
            punctuator(')'),
            node.body);
        
// Expression
    case 'ThisExpression':
        return sseq(
            keyword('this'));

    case 'SequenceExpression':
        return join(node.expressions, punctuator(','));
    
    case 'UnaryExpression':
        return sseq(
            punctuator(node.operator),
            node.argument);
        
    case 'BinaryExpression':
    case 'LogicalExpression':
    case 'AssignmentExpression':
        // TODO: check if param needed 
        return sseq(
            punctuator('('),
            node.left,
            whitespace(' '),
            punctuator(node.operator),
            whitespace(' '),
            node.right,
            punctuator(')'));

    case 'UpdateExpression':
        return (node.prefix ?
            sseq(
                punctuator(node.operator),
                node.argument) :
            sseq(
                node.argument,
                punctuator(node.operator)));
    
    case 'ConditionalExpression':
        return sseq(
            punctuator('('),
            node.test,
            whitespace(' '),
            punctuator('?'),
            whitespace(' '),
            node.consequent,
            whitespace(' '),
            punctuator(':'),
            whitespace(' '),
            node.alternate,
            punctuator(')'));
    
    case 'NewExpression':
        return sseq(
            keyword('new'),
            whitespace(' '),
            node.callee,
            (node.args ?
                sseq(
                    punctuator('('),
                    joins(node.args.map(_unparse), sseq(
                        punctuator(','),
                        whitespace(' '))),
                    punctuator(')')) :
                stream.end));
    
    case 'CallExpression':
        return sseq(
            node.callee,
            punctuator('('),
            joins(node.args.map(_unparse), sseq(
                punctuator(','),
                whitespace(' '))),
            punctuator(')'));
        
    case 'MemberExpression':
        return (node.computed ?
            sseq(
                node.object,
                punctuator('['),
                node.property,
                punctuator(']')) :
            sseq(
                node.object,
                punctuator('.'),
                node.property));
 
    case 'ArrayExpression': ArrayExpression:
        return sseq(
            punctuator('['),
            joins(node.elements.map(_unparse), sseq(
                punctuator(','),
                whitespace(' '))),
            punctuator(']'));
    
    case 'ObjectExpression': ArrayExpression:
        return sseq(
            punctuator('{'),
            lineTerminator('\n'),
            joins(node.properties.map(function(x) {
                switch (x.kind) {
                case 'get':
                    return sseq(
                        new token.IdentifierToken(null, 'get'),
                        whitespace(' '),
                        x.key,
                        punctuator('('),
                        punctuator(')'),
                        punctuator(':'),
                        whitespace(' '),
                        punctuator('{'),
                        x.value.body,
                        punctuator('}'));
                 case 'set':
                    return sseq(
                        new token.IdentifierToken(null, 'set'),
                        whitespace(' '),
                        x.key,
                        punctuator('('),
                        x.value.params,
                        punctuator(')'),
                        punctuator(':'),
                        whitespace(' '),
                        punctuator('{'),
                        x.value.body,
                        punctuator('}'));
                case 'init':
                default:
                    return sseq(
                        x.key,
                        punctuator(':'),
                        whitespace(' '),
                        x.value);
                }
            }), sseq(
                punctuator(','),
                lineTerminator('\n'))),
            lineTerminator('\n'),
            punctuator('}'));

// Function
    case 'FunctionExpression':
        return sseq(
            keyword('function'),
            (node.id ?
                sseq(
                    whitespace(' '),
                    node.id):
                stream.end),
            punctuator('('),
            joins(node.params.map(_unparse), sseq(
                punctuator(','),
                whitespace(' '))),
            punctuator(')'),
            whitespace(' '),
            punctuator('{'),
            lineTerminator('\n'),
           node.body,
            punctuator('}'));
        
    case 'FunctionDeclaration':
        return sseq(
            keyword('function'),
            (node.id ?
                sseq(
                    whitespace(' '),
                    node.id):
                stream.end),
            punctuator('('),
            joins(node.params.map(_unparse), sseq(
                punctuator(','),
                whitespace(' '))),
            punctuator(')'),
            whitespace(' '),
            punctuator('{'),
            lineTerminator('\n'),
            node.body,
            punctuator('}'));

// Program
    case 'Program':
        return sseq(node.body);

// Declarations
    case 'VariableDeclaration':
        return sseq(
            keyword('var'),
            whitespace(' '),
            join(node.declarations.map(_unparse), punctuator(',')),
            punctuator(';'),
            lineTerminator('\n'));
        
    case 'VariableDeclarator':
        return sseq(
            node.id,
            (node.init ?
                sseq(
                    whitespace(' '),
                    punctuator('='),
                    whitespace(' '),
                    _unparse(node.init)) :
                stream.end));

// Value
    case 'Identifier':
        return stream.cons(new token.IdentifierToken(node.loc, node.name), stream.end);
    
    case 'Literal':
        switch (node.kind) {
        case 'string':
            return stream.cons(new token.StringToken(node.loc, node.value), stream.end)
        case 'number':
            return stream.cons(new token.NumberToken(node.loc, node.value), stream.end)
        case 'null':
            return stream.cons(new token.NullToken(node.loc, node.value), stream.end)
        case 'boolean':
            return stream.cons(new token.BooleanToken(node.loc, node.value), stream.end)
        case 'RegExp':
            return stream.cons(new token.RegularExpressionToken(node.loc, node.value), stream.end)
        default:
            return stream.end;
        }
        
    default:
        return stream.end;
    }
};

/**
 * Transform an AST to a stream of tokens.
 * 
 * Returned stream inserts line terminators for pretty printing.
 * 
 * @param node Root of AST to unparse.
 * 
 * @return Stream of parse-ecma lex tokens.
 */
var unparse = (function(){
    var indent = function(ind, s) {
        if (stream.isEmpty(s)) {
            return s;
        }
        
        var first = stream.first(s);
        var rest = stream.rest(s);
        
        if (first.type === 'LineTerminator') {
            if (!stream.isEmpty(rest)) {
                var next = stream.first(rest);
                if (next.type === 'Punctuator' && next.value === '}') {
                    var padding = gen.repeat(ind - 4, whitespace(' '));
                    return stream.cons(first, stream.concat(padding, indent(ind, rest)));
                }
            }
            var padding = gen.repeat(ind, whitespace(' '));
            return stream.cons(first, stream.concat(padding, indent(ind, rest)));
        }
        
        if (first.type === 'Punctuator') {
            switch  (first.value) {
            case '{': ind += 4; break;
            case '}': ind -= 4; break;
            }
        }
        
        return stream.stream(first, indent.bind(undefined, ind, stream.rest(s)));
    };
    
    return function(node) {
        return indent(0, _unparse(node));
    };
}());

/* Export
 ******************************************************************************/
return {
    'unparse': unparse
};

});