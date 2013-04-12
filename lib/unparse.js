/**
 * @fileOverview Transforming an AST into a stream of tokens.
 */
define(['nu/stream', 'nu/gen',
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
        return stream.append(arr[0], stream.cons(joiner, join(arr.slice(1), joiner)));
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
        return stream.append(arr[0], stream.append(joiner, joins(arr.slice(1), joiner)));
    }
};

/* Token
 ******************************************************************************/
var keyword = function(x) {
    return new token.KeywordToken(null, x);
};

var identifier = function(x) {
    return new token.IdentifierToken(null, x);
};

var lineTerminator = function(x) {
    return new token.LineTerminatorToken(null, (x === undefined ? '\n' : x));
};

var punctuator = function(x) {
    return new token.PunctuatorToken(null, x);
};

var whitespace = function(x) {
    return new token.WhitespaceToken(null, (x === undefined ? ' ' : x));
};

/* Unparsing
 ******************************************************************************/
var seq = function(/*...*/) {
    if (arguments.length === 0) {
        return stream.end;
    }
    var first = arguments[0],
        rest = seq.apply(undefined, slice.call(arguments, 1));

    if (stream.isEmpty(first)) {
        return rest;
    }
    
    if (first === undefined) {
        return rest;
    }
    
    if (first instanceof token.Token) {
        return stream.cons(first, rest)
    } else if (first instanceof node.Node) {
        return stream.append(_unparse(first), rest)
    } else if (Array.isArray(first)) {
        return stream.append(stream.append.apply(undefined, first.map(_unparse)), rest)
    } else if (stream.isStream(first)) {
        return stream.append(first, rest);
    } else {
        return stream.cons(first, rest)
    }
};

/* 
 ******************************************************************************/
var statement = function(/*...*/) {
    return seq(
        seq.apply(undefined, arguments),
        lineTerminator());
};

var expression = function(/*...*/) {
    return seq.apply(undefined, arguments);
};

var declaration = function(/*...*/) {
    return seq.apply(undefined, arguments);
};

var clause = function(/*...*/) {
    return seq(
        seq.apply(undefined, arguments),
        lineTerminator());
};


/* Unparsing
 ******************************************************************************/

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
        return seq(
            (node.test ?
                seq(
                    keyword('case'),
                    whitespace(),
                    _unparse(node.test)) :
                keyword('default')),
            punctuator(':'),
            lineTerminator(),
            node.consequent);
   
    case 'CatchClause':
        return seq(
            keyword('catch'),
            punctuator('('),
            node.param,
            punctuator(')'),
            node.body);
    
// Statement
    case 'EmptyStatement':
        return statement(
            punctuator(';'));
        
    case 'DebuggerStatement':
        return statement(
            keyword('debugger'),
            punctuator(';'));
    
    case 'BlockStatement':
        return statement(
            punctuator('{'),
            lineTerminator(),
            node.body,
            punctuator('}'));
        
    case 'ExpressionStatement':
        return statement(
            node.expression,
            punctuator(';'));
    
    case 'IfStatement':
        return statement(
            keyword('if'),
            whitespace(),
            punctuator('('),
            node.test,
            punctuator(')'),
            node.consequent,
            (!node.alternate ? stream.end :
                seq(
                    keyword('else'),
                    whitespace(),
                    node.alternate)));
        
    case 'LabeledStatement':
        return statement(
            identifier(node.label),
            punctuator(':'),
            node.body);
        
    case 'BreakStatement':
        return statement(
            keyword('break'),
            whitespace(),
            node.identifier,
            punctuator(';'));
        
    case 'ContinueStatement':
        return statement(
            keyword('continue'),
            whitespace(),
            node.identifier,
            punctuator(';'));
        
    case 'WithStatement':
        return statement(
            keyword('with'),
            punctuator('('),
            node.object,
            punctuator(')'),
            punctuator('{'),
            node.body,
            punctuator('}'));
        
    case 'SwitchStatement':
        return statement(
            keyword('switch'),
            punctuator('('),
            node.discriminant,
            punctuator(')'),
            punctuator('{'),
            lineTerminator(),
            node.cases,
            punctuator('}'));
    
    case'ReturnStatement':
        return statement(
            keyword('return'),
            whitespace(),
            node.argument,
            punctuator(';'));
    
    case 'ThrowStatement':
        return statement(
            keyword('throw'),
            whitespace(),
            node.argument,
            punctuator(';'));
    
    case 'TryStatement':
        return statement(
            keyword('try'),
            node.block,
            node.handler,
            (node.finalizer ?
                seq(
                    keyword('finally'),
                    node.finalizer) :
                stream.end));
    
    case 'WhileStatement':
        return statement(
            keyword('while'),
            punctuator('('),
            node.test,
            punctuator(')'),
            node.body);
        
    case 'DoWhileStatement':
        return statement(
            keyword('do'),
            node.body,
            keyword('while'),
            punctuator('('),
            node.test,
            punctuator(')'),
            punctuator(';'));
    
    case 'ForStatement':
        return statement(
            keyword('for'),
            punctuator('('),
            node.init,
            (node.init.type === "VariableDeclaration" ?
                whitespace() :
                punctuator(';')),
            node.test,
            punctuator(';'),
            node.update,
            punctuator(')'),
            node.body);
        
    case 'ForInStatement':
        return statement(
            keyword('for'),
            punctuator('('),
            node.left,
            punctuator('in'),
            node.right,
            punctuator(')'),
            node.body);
        
// Expression
    case 'ThisExpression':
        return expression(
            keyword('this'));

    case 'SequenceExpression':
        return expression(
            join(node.expressions, punctuator(',')));
    
    case 'UnaryExpression':
        return expression(
            punctuator(node.operator),
            node.argument);
        
    case 'BinaryExpression':
    case 'LogicalExpression':
    case 'AssignmentExpression':
        // TODO: check if param needed 
        return expression(
            punctuator('('),
            node.left,
            whitespace(),
            punctuator(node.operator),
            whitespace(),
            node.right,
            punctuator(')'));

    case 'UpdateExpression':
        return (node.prefix ?
            expression(
                punctuator(node.operator),
                node.argument) :
            expression(
                node.argument,
                punctuator(node.operator)));
    
    case 'ConditionalExpression':
        return expression(
            punctuator('('),
            node.test,
            whitespace(),
            punctuator('?'),
            whitespace(),
            node.consequent,
            whitespace(),
            punctuator(':'),
            whitespace(),
            node.alternate,
            punctuator(')'));
    
    case 'NewExpression':
        return expression(
            keyword('new'),
            whitespace(),
            node.callee,
            (node.args ?
                seq(
                    punctuator('('),
                    joins(node.args.map(_unparse), seq(
                        punctuator(','),
                        whitespace())),
                    punctuator(')')) :
                stream.end));
    
    case 'CallExpression':
        return expression(
            node.callee,
            punctuator('('),
            joins(node.args.map(_unparse), seq(
                punctuator(','),
                whitespace())),
            punctuator(')'));
        
    case 'MemberExpression':
        return (node.computed ?
            expression(
                node.object,
                punctuator('['),
                node.property,
                punctuator(']')) :
            expression(
                node.object,
                punctuator('.'),
                node.property));
 
    case 'ArrayExpression': ArrayExpression:
        return expression(
            punctuator('['),
            joins(node.elements.map(_unparse), seq(
                punctuator(','),
                whitespace())),
            punctuator(']'));
    
    case 'ObjectExpression': ArrayExpression:
        return expression(
            punctuator('('),
            punctuator('{'),
            lineTerminator(),
            joins(node.properties.map(function(x) {
                switch (x.kind) {
                case 'get':
                    return seq(
                        identifier('get'),
                        whitespace(),
                        x.key,
                        punctuator('('),
                        punctuator(')'),
                        punctuator(':'),
                        whitespace(),
                        punctuator('{'),
                        x.value.body,
                        punctuator('}'));
                 case 'set':
                    return seq(
                        identifier('set'),
                        whitespace(),
                        x.key,
                        punctuator('('),
                        x.value.params,
                        punctuator(')'),
                        punctuator(':'),
                        whitespace(),
                        punctuator('{'),
                        x.value.body,
                        punctuator('}'));
                case 'init':
                default:
                    return seq(
                        x.key,
                        punctuator(':'),
                        whitespace(),
                        x.value);
                }
            }), seq(
                punctuator(','),
                lineTerminator())),
            lineTerminator(),
            punctuator('}'),
            punctuator(')'));

// Function
    case 'FunctionExpression':
        return expression(
            keyword('function'),
            (node.id ?
                seq(
                    whitespace(),
                    node.id):
                stream.end),
            punctuator('('),
            joins(node.params.map(_unparse), seq(
                punctuator(','),
                whitespace())),
            punctuator(')'),
            whitespace(),
            node.body);
        
    case 'FunctionDeclaration':
        return seq(
            keyword('function'),
            (node.id ?
                seq(
                    whitespace(),
                    node.id):
                stream.end),
            punctuator('('),
            joins(node.params.map(_unparse), seq(
                punctuator(','),
                whitespace())),
            punctuator(')'),
            whitespace(),
            node.body);

// Program
    case 'Program':
        return seq(node.body);

// Declarations
    case 'VariableDeclaration':
        return statement(
            keyword('var'),
            whitespace(),
            join(node.declarations.map(_unparse), punctuator(',')),
            punctuator(';'));
        
    case 'VariableDeclarator':
        return declaration(
            node.id,
            (node.init ?
                seq(
                    whitespace(),
                    punctuator('='),
                    whitespace(),
                    _unparse(node.init)) :
                stream.end));

// Value
    case 'Identifier':
        return seq(
            new token.IdentifierToken(node.loc, node.name));
    
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
        case 'regexp':
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
                    var padding = gen.repeat(ind - 4, whitespace());
                    return stream.cons(first, stream.append(padding, indent(ind, rest)));
                }
            }
            var padding = gen.repeat(ind, whitespace());
            return stream.cons(first, stream.append(padding, indent(ind, rest)));
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