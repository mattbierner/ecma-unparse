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

/* 
 ******************************************************************************/
var seq = function(/*...*/) {
    if (arguments.length === 0) {
        return stream.end;
    }
    
    var first = arguments[0],
        rest = seq.apply(undefined, slice.call(arguments, 1));

    if (first === undefined || stream.isEmpty(first)) {
        return rest;
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
var program = function(body) {
    return seq.apply(undefined, body);
}; 

var variableDeclaration = function(declarations) {
    return statement(
        keyword('var'),
        whitespace(),
        join(declarations, punctuator(',')),
        punctuator(';'));
};

var variableDeclarator = function(id, init) {
    return declaration(
        id,
        (init ?
            seq(
                whitespace(),
                punctuator('='),
                whitespace(),
                init) :
            stream.end));
};

var functionExpression = function(id, params, body) {
    return expression(
        keyword('function'),
        (id ?
            seq(
                whitespace(),
                id):
            stream.end),
        punctuator('('),
        joins(params, seq(
            punctuator(','),
            whitespace())),
        punctuator(')'),
        whitespace(),
        body);
};

var functionDeclaration = function(id, params, body) {
    return functionExpression(id, params, body);
};

var switchCase = function(test, consequent) {
    return seq(
        (test ?
            seq(
                keyword('case'),
                whitespace(),
                test) :
            keyword('default')),
        punctuator(':'),
            lineTerminator(),
            seq.apply(undefined, consequent));
};

var catchClause = function(param, body) {
    return seq(
        keyword('catch'),
        punctuator('('),
        param,
        punctuator(')'),
        body);
};

/* Statement Unparsing
 ******************************************************************************/
var emptyStatement = function(){
    return statement(
        punctuator(';'));
};

var debuggerStatement = function() {
    return statement(
        keyword('debugger'),
        punctuator(';'));
};

var blockStatement = function(body) {
    return statement(
        punctuator('{'),
        lineTerminator(),
        seq.apply(undefined, body),
        punctuator('}'));
};

var expressionStatement = function(expression) {
    return statement(
        expression,
        punctuator(';'));
};

var ifStatement = function(test, consequent, alternate) {
    return statement(
        keyword('if'),
        whitespace(),
        punctuator('('),
        test,
        punctuator(')'),
        consequent,
        (!alternate ? stream.end :
            seq(
                keyword('else'),
                whitespace(),
                alternate)));
};

var labeledStatement = function(label, body) {
    return statement(
        identifier(label),
        punctuator(':'),
        body);
};

var breakStatement = function(label) {
    return statement(
        keyword('break'),
        whitespace(),
        label,
        punctuator(';'));
};

var continueStatement = function(label) {
    return statement(
        keyword('continue'),
        whitespace(),
        label,
        punctuator(';'));
};

var withStatement = function(obj, body) {
    return statement(
        keyword('with'),
        punctuator('('),
        object,
        punctuator(')'),
        punctuator('{'),
        body,
        punctuator('}'));
};

var switchStatement = function(discriminant, cases) {
    return statement(
        keyword('switch'),
        punctuator('('),
        discriminant,
        punctuator(')'),
        punctuator('{'),
        lineTerminator(),
        seq.apply(undefined, cases),
        punctuator('}'));
};

var returnStatement = function(argument) {
    return statement(
        keyword('return'),
        whitespace(),
        argument,
        punctuator(';'));
};

var throwStatement = function() {
    return statement(
        keyword('throw'),
        whitespace(),
        argument,
        punctuator(';'));
};

var tryStatemen = function(block, handler, finalizer) {
    return statement(
        keyword('try'),
        block,
        handler,
        (finalizer ?
            seq(
                keyword('finally'),
                finalizer) :
            stream.end));
};

var whileStatement = function(test, body) { 
    return statement(
        keyword('while'),
        punctuator('('),
        test,
        punctuator(')'),
        body);
};

var doWhileStatement = function(body, test) {
    return statement(
        keyword('do'),
        body,
        keyword('while'),
        punctuator('('),
        test,
        punctuator(')'),
        punctuator(';'));
};

var forDeclarationStatement = function(init, test, update, body) {
    return statement(
        keyword('for'),
        punctuator('('),
        init,
        whitespace(),
        test,
        punctuator(';'),
        update,
        punctuator(')'),
        body);
};

var forStatement = function(init, test, update, body) {
    return statement(
        keyword('for'),
        punctuator('('),
        init,
        punctuator(';'),
        test,
        punctuator(';'),
        update,
        punctuator(')'),
        body);
};

var forInStatement = function(left, right) {
    return statement(
        keyword('for'),
        punctuator('('),
        node.left,
        punctuator('in'),
        node.right,
        punctuator(')'),
        node.body);
};



/* Expression Unparsing
 ******************************************************************************/
var thisExpression = function() {
    return expression(
        keyword('this'));
};

var sequenceExpression = function(expressions) {
    return expression(
        join(expressions, punctuator(',')));
};

var unaryExpression = function(op, arg) {
    return expression(
        op,
        whitespace(),
        arg);
};

var binaryExpression = function(op, left, right) {
    return expression(
        punctuator('('),
        left,
        whitespace(),
        op,
        whitespace(),
        right,
        punctuator(')'));
};
    
var updateExpression = function(op, arg, prefix){
    return (prefix ?
        expression(op, arg) :
        expression(arg, op));
};

var conditionalExpression = function(test, consequent, alternate) {
    return expression(
        punctuator('('),
        test,
        whitespace(),
        punctuator('?'),
        whitespace(),
        consequent,
        whitespace(),
        punctuator(':'),
        whitespace(),
        alternate,
        punctuator(')'));
};

var newExpression = function(callee, args) {
    return expression(
        keyword('new'),
        whitespace(),
        callee,
        (args ?
            seq(
                punctuator('('),
                joins(args, seq(
                    punctuator(','),
                    whitespace())),
                punctuator(')')) :
            stream.end));
};

var callExpression = function(callee, args) {
    return expression(
        callee,
        punctuator('('),
        joins(args, seq(
            punctuator(','),
            whitespace())),
        punctuator(')'));
};

var memberExpression = function(obj, property, computed) {
    return (computed ?
        expression(
            obj,
            punctuator('['),
            property,
            punctuator(']')) :
        expression(
            obj,
            punctuator('.'),
                property));
};
 
var arrayExpression = function(elements) {
    return expression(
        punctuator('['),
        joins(elements, seq(
            punctuator(','),
            whitespace())),
        punctuator(']'));
};

var objectExpression = function(properties) {
     return expression(
        punctuator('('),
        punctuator('{'),
        lineTerminator(),
        joins(properties, seq(
            punctuator(','),
            lineTerminator())),
        lineTerminator(),
        punctuator('}'),
        punctuator(')'));
};

var objectGetExpression = function(key, body) {
    return seq(
        identifier('get'),
        whitespace(),
        key,
        punctuator('('),
        punctuator(')'),
        whitespace(),
        body);
};

var objectSetExpression = function(key, params, body) {
    return seq(
        identifier('set'),
        whitespace(),
        key,
        punctuator('('),
        params,
        punctuator(')'),
        whitespace(),
        body);
};

var objectValueExpression = function(key, value) {
    return seq(
        key,
        punctuator(':'),
        whitespace(),
        value);
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
        return switchCase(
            (node.test ?
                _unparse(node.test) :
                null),
            node.consequent.map(_unparse));
   
    case 'CatchClause':
        return catchClause(
            _unparse(node.param),
            _unparse(node.body));
    
// Statement
    case 'EmptyStatement':
        return emptyStatement()
        
    case 'DebuggerStatement':
        return debuggerStatement();
    
    case 'BlockStatement':
        return blockStatement(
            node.body.map(_unparse));
        
    case 'ExpressionStatement':
        return expressionStatement(
            _unparse(node.expression));
    
    case 'IfStatement':
        return ifStatement(
            _unparse(node.test),
            _unparse(node.consequent),
            (node.alternate ?
                _unparse(node.alternate) :
                null));
        
    case 'LabeledStatement':
        return labeledStatement(
            _unparse(node.label),
            _unparse(node.body));
        
    case 'BreakStatement':
        return breakStatement(
           _unparse(node.label));
        
    case 'ContinueStatement':
        return continueStatement(
            _unparse(node.label));
        
    case 'WithStatement':
        return withStatement(
            _unparse(node.object),
            _unparse(node.body));
    
    case 'SwitchStatement':
        return switchStatement(
            _unparse(node.discriminant),
            node.cases.map(_unparse));
    
    case'ReturnStatement':
        return returnStatement(
            _unparse(node.argument));
    
    case 'ThrowStatement':
        return throwStatement(
            _unparse(node.argument));
    
    case 'TryStatement':
        return tryStatement(
            _unparse(node.block),
            (node.handler ?
                _unparse(node.handler) :
                null),
            (node.finalizer ?
                node.finalizer :
                null));
    
    case 'WhileStatement':
        return whileStatement(
            _unparse(node.test),
            _unparse(node.body));
    
    case 'DoWhileStatement':
        return doWhileStatement(
            _unparse(node.body),
            _unparse(node.test));
    
    case 'ForStatement':
        var init = (node.init ? _unparse(node.init) : null);
        var test = (node.test ? _unparse(node.test) : null);
        var update = (node.update ? _unparse(node.update) : null);
        var body = _unparse(node.body);
        return (node.init && node.init.type ===  "VariableDeclaration" ?
            forDeclarationStatement(init, test, update, body) :
            forStatement(init, test, update, body));
        
    case 'ForInStatement':
        return forInStatement(
            _unparse(node.left),
            _unparse(node.right),
            _unparse(node.body));
        
// Expression
    case 'ThisExpression':
        return thisExpression();

    case 'SequenceExpression':
        return sequenceExpression(node.expressions.map(_unparse));
    
    case 'UnaryExpression':
        return unaryExpression(
            punctuator(node.operator),
            _unparse(node.argument));
        
    case 'BinaryExpression':
    case 'LogicalExpression':
    case 'AssignmentExpression':
        return binaryExpression(
            punctuator(node.operator),
            _unparse(node.left),
            _unparse(node.right));

    case 'UpdateExpression':
        return updateExpression(
            punctuator(node.operator),
            _unparse(node.argument),
            node.prefix);
        
    case 'ConditionalExpression':
        return conditionalExpression(
            _unparse(node.test),
            _unparse(node.consequent),
            _unparse(node.alternate));
    
    case 'NewExpression':
        return newExpression(
            _unparse(node.callee),
            (node.args ?
                node.args.map(_unparse) :
                null));
    
    case 'CallExpression':
        return callExpression(
            _unparse(node.callee),
            node.args.map(_unparse));
        
    case 'MemberExpression':
        return memberExpression(
            _unparse(node.object),
            _unparse(node.property),
            node.computed);
        
    case 'ArrayExpression':
        return arrayExpression(node.elements.map(_unparse));
    
    case 'ObjectExpression':
        return objectExpression(node.properties.map(function(x) {
            switch (x.kind) {
            case 'get':
                return objectGetExpression(x.key, x.value.body);
            case 'set':
                return objectSetExpression(x.key, x.value.params, x.value.body);
            case 'init':
            default:
                return objectValueExpression(x.key, x.value);
            }
        }));

// Function
    case 'FunctionExpression':
        return functionExpression(
            node.id,
            node.params.map(_unparse),
            _unparse(node.body));
        
    case 'FunctionDeclaration':
        return functionDeclaration(
            node.id,
            node.params.map(_unparse),
            _unparse(node.body));

// Program
    case 'Program':
        return program(node.body.map(_unparse));

// Declarations
    case 'VariableDeclaration':
        return variableDeclaration(node.declarations.map(_unparse));
        
    case 'VariableDeclarator':
        return variableDeclarator(
            _unparse(node.id),
            (node.init ?
                _unparse(node.init) :
                null));

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