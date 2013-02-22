/**
 * @fileOverview Transforming an AST into a stream of tokens.
 */
define(['stream/stream', 'stream/gen',
        'ecma/lex/token',
        'ecma/position'],
function(stream, gen,
        token,
        position){

/* Prototypes
 ******************************************************************************/
var slice = Array.prototype.slice;

/* Stream Utilities
 ******************************************************************************/
var seq = function(/*...*/) {
    if (arguments.length === 0) {
        return stream.end;
    }
    var first = arguments[0],
        rest = seq.apply(undefined, slice.call(arguments, 1));

    if (stream.isEmpty(first))
        return rest;
    
    if (first.first) {
        return stream.concat(first, rest)
    } else {
        return stream.cons(first, rest)
    }
};

var join = function(arr, joiner) {
    if (arr.length === 0) {
        return stream.end;
    }
    if (arr.length === 1) {
        return arr[0]
    }
    return stream.concat(arr[0], stream.cons(joiner, join(arr.slice(1), joiner)))
};

var joins = function(arr, joiner) {
    if (arr.length === 0) {
        return stream.end;
    }
    if (arr.length === 1) {
        return arr[0]
    }
    return stream.concat(arr[0], stream.concat(joiner, joins(arr.slice(1), joiner)))
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
var _unparse = function(node) {
    if (!node) {
        return stream.end;
    }
        
    switch (node.type) {
// clauses
    case 'SwitchCase':
        return seq(
            keyword('case'),
            _unparse(node.test),
            punctuator(':'),
            _unparse(node.consequent));
   
    case 'CatchClause':
        return seq(
            keyword('catch'),
            punctuator('('),
            _unparse(node.param),
            punctuator(')'),
            _unparse(node.body));
    
// Statement
    case 'EmptyStatement':
        return seq(
            punctuator(';'));
        
    case 'DebuggerStatement':
        return seq(
            keyword('debugger'),
            punctuator(';'));
    
    case 'BlockStatement':
        return seq(
            punctuator('{'),
            lineTerminator('\n'),
            stream.concata.apply(undefined, node.body.map(_unparse)),
            punctuator('}'),
            lineTerminator('\n'));
        
    case 'ExpressionStatement':
        return seq(
            _unparse(node.expression),
            punctuator(';'),
            lineTerminator('\n'));
    
    case 'IfStatement':
        return seq(
            keyword('if'),
            punctuator('('),
            _unparse(node.test),
            punctuator(')'),
            _unparse(node.consequent),
            (!node.alternate ? stream.end :
                seq(
                    keyword('else'),
                    _unparse(node.alternate))));
        
    case 'LabeledStatement':
        return seq(
            new token.IdentifierToken(null, node.label),
            punctuator(';'),
            _unparse(node.body));
        
    case 'BreakStatement':
        return seq(
            keyword('break'),
            whitespace(' '),
            _unparse(node.identifier),
            punctuator(';'));
        
    case 'ContinueStatement':
        return seq(
            keyword('continue'),
            whitespace(' '),
            _unparse(node.identifier),
            punctuator(';'));
        
    case 'WithStatement':
        return seq(
            keyword('with'),
            punctuator('('),
            _unparse(node.object),
            punctuator(')'),
            punctuator('{'),
            stream.concata.apply(undefined, node.body.map(_unparse)),
            punctuator('}'));
        
    case 'SwitchStatement':
        return seq(
            keyword('switch'),
            punctuator('('),
            _unparse(node.discriminant),
            punctuator(')'),
            punctuator('{'),
            stream.concata.apply(undefined, node.cases.map(_unparse)),
            punctuator('}'));
    
    case'ReturnStatement':
        return seq(
            keyword('return'),
            whitespace(' '),
            _unparse(node.argument),
            punctuator(';'),
            new token.LineTerminatorToken(null, '\n'));
    
    case 'ThrowStatement':
        return seq(
            keyword('throw'),
            whitespace(' '),
            _unparse(node.argument),
            punctuator(';'));
    
    case 'TryStatement':
        return seq(
            keyword('try'),
            _unparse(node.block),
            _unparse(node.handler),
            (node.finalizer ?
                seq(
                    keyword('finally'),
                    _unparse(node.finalizer)) :
                stream.end));
    
    case 'WhileStatement':
        return seq(
            keyword('while'),
            punctuator('('),
            _unparse(node.test),
            punctuator(')'),
            _unparse(node.body));
        
    case 'DoWhileStatement':
        return seq(
            keyword('do'),
            _unparse(node.body),
            keyword('while'),
            punctuator('('),
            _unparse(node.test),
            punctuator(')'),
            punctuator(';'));
    
    case 'ForStatement':
        return seq(
            keyword('for'),
            punctuator('('),
            _unparse(node.init),
            (node.init.type === "VariableDeclaration" ? whitespace(' ') : punctuator(';')),
            _unparse(node.test),
            punctuator(';'),
            _unparse(node.update),
            punctuator(')'),
            _unparse(node.body));
        
    case 'ForInStatement':
        return seq(
            keyword('for'),
            punctuator('('),
            _unparse(node.left),
            punctuator('in'),
            _unparse(node.right),
            punctuator(')'),
            _unparse(node.body));
        
// Expression
    case 'ThisExpression':
        return stream.cons(keyword('this'), stream.end);

    case 'SequenceExpression':
        return join(node.expressions, new token.KeywordToken(null, ','));
    
    case 'UnaryExpression':
        return stream.cons(new token.PunctuatorToken(null, node.operator),
            _unparse(node.argument));
        
    case 'BinaryExpression':
    case 'LogicalExpression':
    case 'AssignmentExpression':
        // TODO: check if param needed 
        return seq(
            punctuator('('),
            _unparse(node.left),
            whitespace(' '),
            new token.PunctuatorToken(null, node.operator),
            whitespace(' '),
            _unparse(node.right),
            punctuator(')'));

    case 'UpdateExpression':
        return (node.prefix ?
            stream.cons(new token.PunctuatorToken(null, node.operator),
                _unparse(node.argument)) :
            stream.concat(_unparse(node.argument), stream.cons(new token.PunctuatorToken(null, node.operator), stream.end)));
    
    case 'ConditionalExpression':
        return seq(
                punctuator('('),
            _unparse(node.test),
            whitespace(' '),
            punctuator('?'),
            whitespace(' '),
            _unparse(node.consequent),
            whitespace(' '),
            punctuator(':'),
            whitespace(' '),
            _unparse(node.alternate),
            punctuator(')'));
    
    case 'NewExpression':
        return seq(
            keyword('new'),
            whitespace(' '),
            _unparse(node.callee),
            (node.args ?
                seq(
                    punctuator('('),
                    joins(node.args.map(_unparse), seq(
                        punctuator(','),
                        whitespace(' '))),
                    punctuator(')')) :
                stream.end));
    
    case 'CallExpression':
        return seq(
            _unparse(node.callee),
            punctuator('('),
            joins(node.args.map(_unparse), seq(
                punctuator(','),
                whitespace(' '))),
            punctuator(')'));
        
    case 'MemberExpression':
        return (node.computed ?
            seq(
                _unparse(node.object),
                punctuator('['),
                _unparse(node.property),
                punctuator(']')) :
            seq(
                _unparse(node.object),
                punctuator('.'),
                _unparse(node.property)));
 
    case 'ArrayExpression': ArrayExpression:
        return seq(
            punctuator('['),
            joins(node.elements.map(_unparse), seq(
                punctuator(','),
                whitespace(' '))),
            punctuator(']'));
    
    case 'ObjectExpression': ArrayExpression:
        return seq(
            punctuator('{'),
            new token.LineTerminatorToken(null, '\n'),
            joins(node.properties.map(function(x) {
                switch (x.kind) {
                case 'get':
                    return seq(
                        new token.IdentifierToken(null, 'get'),
                        whitespace(' '),
                        _unparse(x.key),
                        punctuator('('),
                        punctuator(')'),
                        punctuator(':'),
                        whitespace(' '),
                        punctuator('{'),
                        stream.concata.apply(undefined, x.value.body.map(_unparse)),
                        punctuator('}'));
                 case 'set':
                    return seq(
                        new token.IdentifierToken(null, 'set'),
                        whitespace(' '),
                        _unparse(x.key),
                        punctuator('('),
                        stream.concata.apply(undefined, x.value.params.map(_unparse)),
                        punctuator(')'),
                        punctuator(':'),
                        whitespace(' '),
                        punctuator('{'),
                        stream.concata.apply(undefined, x.value.body.map(_unparse)),
                        punctuator('}'));
                case 'init':
                default:
                    return seq(
                        _unparse(x.key),
                        punctuator(':'),
                        whitespace(' '),
                        _unparse(x.value));
                }
            }), seq(
                punctuator(','),
                new token.LineTerminatorToken(null, '\n'))),
            new token.LineTerminatorToken(null, '\n'),
            punctuator('}'));

// Function
    case 'FunctionExpression':
        return seq(
            keyword('function'),
            (node.id ?
                seq(
                    whitespace(' '),
                    _unparse(node.id)):
                stream.end),
            punctuator('('),
            joins(node.params.map(_unparse), seq(
                punctuator(','),
                whitespace(' '))),
            punctuator(')'),
            whitespace(' '),
            punctuator('{'),
            new token.LineTerminatorToken(null, '\n'),
            stream.concata.apply(undefined, node.body.map(_unparse)),
            punctuator('}'));
        
    case 'FunctionDeclaration':
        return seq(
            keyword('function'),
            (node.id ?
                seq(
                    whitespace(' '),
                    _unparse(node.id)):
                stream.end),
            punctuator('('),
            joins(node.params.map(_unparse), seq(
                punctuator(','),
                whitespace(' '))),
            punctuator(')'),
            whitespace(' '),
            punctuator('{'),
            new token.LineTerminatorToken(null, '\n'),
            stream.concata.apply(undefined, node.body.map(_unparse)),
            punctuator('}'));

// Program
    case 'Program':
        return stream.concata.apply(undefined, node.body.map(_unparse));

// Declarations
    case 'VariableDeclaration':
        return seq(
            keyword('var'),
            whitespace(' '),
            join(node.declarations.map(_unparse), punctuator(',')),
            punctuator(';'),
            new token.LineTerminatorToken(null, '\n'));
        
    case 'VariableDeclarator':
        return stream.concat(_unparse(node.id), (node.init ?
            seq(whitespace(' '), punctuator('='), whitespace(' '), _unparse(node.init)):
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