define(['stream/stream', 'stream/gen',
        'ecma_unparse/token',
        'ecma/position'],
function(stream, gen,
        token,
        position){

var slice = Array.prototype.slice;

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


var _unparse = function(indent, node) {
    if (!node) {
        return stream.end;
    }
    
    var ind = gen.repeat(indent, new token.WhitespaceToken(null, ' '));
    switch (node.type) {
// clauses
    case 'SwitchCase':
        return seq(
            new token.KeywordToken(null, 'case'),
            _unparse(indent, node.test),
            new token.PunctuatorToken(null, ':'),
            _unparse(indent, node.consequent));
   
    case 'CatchClause':
        return seq(
            new token.KeywordToken(null, 'catch'),
            new token.PunctuatorToken(null, '('),
            _unparse(indent, node.param),
            new token.PunctuatorToken(null, ')'),
            _unparse(indent, node.body));
    
// Statement
    case 'EmptyStatement':
        return seq(
            ind,
            new token.PunctuatorToken(null, ';'));
        
    case 'DebuggerStatement':
        return seq(
            new token.KeywordToken(null, 'debugger'),
            new token.PunctuatorToken(null, ';'));
    
    case 'BlockStatement':
        return seq(
            new token.PunctuatorToken(null, '{'),
            new token.LineTerminatorToken(null, '\n'),
            stream.concata.apply(undefined, node.body.map(_unparse.bind(undefined, indent + 4))),
            ind,
            new token.PunctuatorToken(null, '}'),
            new token.LineTerminatorToken(null, '\n'));
        
    case 'ExpressionStatement':
        return seq(
            ind,
            _unparse(indent, node.expression),
            new token.PunctuatorToken(null, ';'),
            new token.LineTerminatorToken(null, '\n'));
    
    case 'IfStatement':
        return seq(
            ind,
            new token.KeywordToken(null, 'if'),
            new token.PunctuatorToken(null, '('),
            _unparse(indent, node.test),
            new token.PunctuatorToken(null, ')'),
            _unparse(indent, node.consequent),
            (!node.alternate ? stream.end :
                seq(
                    ind,
                    new token.KeywordToken(null, 'else'),
                    _unparse(indent, node.alternate))));
        
    case 'LabeledStatement':
        return seq(
            new token.IdentifierToken(null, node.label),
            new token.PunctuatorToken(null, ';'),
            _unparse(indent, node.body));
        
    case 'BreakStatement':
        return seq(
            new token.KeywordToken(null, 'break'),
            _unparse(indent, node.identifier),
            new token.PunctuatorToken(null, ';'));
        
    case 'ContinueStatement':
        return seq(
            new token.KeywordToken(null, 'continue'),
            _unparse(indent, node.identifier),
            new token.PunctuatorToken(null, ';'));
        
    case 'WithStatement':
        return seq(
            new token.KeywordToken(null, 'with'),
            new token.PunctuatorToken(null, '('),
            _unparse(indent, node.object),
            new token.PunctuatorToken(null, ')'),
            new token.PunctuatorToken(null, '{'),
            stream.concata.apply(undefined, node.body.map(_unparse.bind(undefined, indent))),
            new token.PunctuatorToken(null, '}'));
        
    case 'SwitchStatement':
        return seq(
            new token.KeywordToken(null, 'switch'),
            new token.PunctuatorToken(null, '('),
            _unparse(node.discriminant),
            new token.PunctuatorToken(null, ')'),
            new token.PunctuatorToken(null, '{'),
            stream.concata.apply(undefined, node.cases.map(_unparse)),
            new token.PunctuatorToken(null, '}'));
    
    case'ReturnStatement':
        return seq(
            ind,
            new token.KeywordToken(new position.SourceLocation(node.loc.start, null), 'return'),
            new token.WhitespaceToken(null, ' '),
            _unparse(indent, node.argument),
            new token.PunctuatorToken(null, ';'),
            new token.LineTerminatorToken(null, '\n'));
    
    case 'ThrowStatement':
        return seq(
            new token.KeywordToken(null, 'throw'),
            _unparse(indent, node.argument),
            new token.PunctuatorToken(null, ';'));
    
    case 'TryStatement':
        return seq(
            new token.KeywordToken(null, 'try'),
            _unparse(indent, node.block),
            _unparse(indent, node.handler),
            (node.finalizer ?
                seq(
                    new token.KeywordToken(null, 'finally'),
                    _unparse(indent, node.finalizer)) :
                stream.end));
    
    case 'WhileStatement':
        return seq(
            new token.KeywordToken(null, 'while'),
            new token.PunctuatorToken(null, '('),
            _unparse(indent, node.test),
            new token.PunctuatorToken(null, ')'),
            _unparse(indent, node.body));
        
    case 'DoWhileStatement':
        return seq(
            new token.KeywordToken(null, 'do'),
            _unparse(indent, node.body),
            new token.KeywordToken(null, 'while'),
            new token.PunctuatorToken(null, '('),
            _unparse(indent, node.test),
            new token.PunctuatorToken(null, ')'),
            new token.PunctuatorToken(null, ';'));
    
    case 'ForStatement':
        return seq(
            new token.KeywordToken(null, 'for'),
            new token.PunctuatorToken(null, '('),
            _unparse(indent, node.init),
            new token.PunctuatorToken(null, ';'),
            _unparse(indent, node.test),
            new token.PunctuatorToken(null, ';'),
            _unparse(indent, node.update),
            new token.PunctuatorToken(null, ')'),
            _unparse(indent, node.body));
        
    case 'ForInStatement':
        return seq(
            new token.KeywordToken(null, 'for'),
            new token.PunctuatorToken(null, '('),
            _unparse(indent, node.left),
            new token.PunctuatorToken(null, 'in'),
            _unparse(indent, node.right),
            new token.PunctuatorToken(null, ')'),
            _unparse(indent, node.body));
        
// Expression
    case 'ThisExpression':
        return stream.cons(new token.KeywordToken(null, 'this'), stream.end);

    case 'SequenceExpression':
        return join(node.expressions, new token.KeywordToken(null, ','));
    
    case 'UnaryExpression':
        return stream.cons(new token.PunctuatorToken(node.operator),
            _unparse(indent, node.argument));
        
    case 'BinaryExpression':
    case 'LogicalExpression':
    case 'AssignmentExpression':
        // TODO: check if param needed 
        return seq(
            new token.PunctuatorToken(null, '('),
            _unparse(indent, node.left),
            new token.WhitespaceToken(null, ' '),
            new token.PunctuatorToken(null, node.operator),
            new token.WhitespaceToken(null, ' '),
            _unparse(indent, node.right),
            new token.PunctuatorToken(null, ')'));

    case 'UpdateExpression':
        return (node.prefix ?
            stream.cons(new token.PunctuatorToken(null, node.operator),
                _unparse(indent, node.argument)) :
            stream.concat(_unparse(indent, node.argument), stream.cons(new token.PunctuatorToken(null, node.operator), stream.end)));
    
    case 'ConditionalExpression':
        return seq(
                new token.PunctuatorToken(null, '('),
            _unparse(indent, node.test),
            new token.WhitespaceToken(null, ' '),
            new token.PunctuatorToken(null, '?'),
            new token.WhitespaceToken(null, ' '),
            _unparse(indent, node.consequent),
            new token.WhitespaceToken(null, ' '),
            new token.PunctuatorToken(null, ':'),
            new token.WhitespaceToken(null, ' '),
            _unparse(indent, node.alternate),
            new token.PunctuatorToken(null, ')'));
    
    case 'NewExpression':
        return seq(
            new token.KeywordToken(null, 'new'),
            new token.WhitespaceToken(null, ' '),
            _unparse(indent, node.callee),
            (node.args ?
                seq(
                    new token.PunctuatorToken(null, '('),
                    joins(node.args.map(_unparse.bind(undefined, indent)), seq(
                        new token.PunctuatorToken(null, ','),
                        new token.WhitespaceToken(null, ' '))),
                    new token.PunctuatorToken(null, ')')) :
                stream.end));
    
    case 'CallExpression':
        return seq(
            _unparse(indent, node.callee),
            new token.PunctuatorToken(null, '('),
            joins(node.args.map(_unparse.bind(undefined, indent)), seq(
                new token.PunctuatorToken(null, ','),
                new token.WhitespaceToken(null, ' '))),
            new token.PunctuatorToken(null, ')'));
        
    case 'MemberExpression':
        return (node.computed ?
            seq(
                _unparse(indent, node.object),
                new token.PunctuatorToken(null, '['),
                _unparse(indent, node.property),
                new token.PunctuatorToken(null, ']')) :
            seq(
                _unparse(indent, node.object),
                new token.PunctuatorToken(null, '.'),
                _unparse(indent, node.property)));
 
    case 'ArrayExpression': ArrayExpression:
        return seq(
            new token.PunctuatorToken(null, '['),
            joins(node.elements.map(_unparse.bind(undefined, indent)), seq(
                new token.PunctuatorToken(null, ','),
                new token.WhitespaceToken(null, ' '))),
            new token.PunctuatorToken(null, ']'));
    
    case 'ObjectExpression': ArrayExpression:
        return seq(
            new token.PunctuatorToken(null, '{'),
            join(node.properties.map(function(x) {
                switch (x.kind) {
                case 'init':
                default:
                    return seq(
                        x.key,
                        new token.PunctuatorToken(null, ':'),
                        _unparse(indent, x.value))
                }
            }), new token.PunctuatorToken(null, ',')),
            new token.PunctuatorToken(null, '}'));

// Function
    case 'FunctionExpression':
        return seq(
            new token.KeywordToken(new position.SourceLocation(node.loc.start, null), 'function'),
            (node.id ?
                seq(
                    new token.WhitespaceToken(null, ' '),
                    _unparse(indent, node.id)):
                stream.end),
            new token.PunctuatorToken(null, '('),
            joins(node.params.map(_unparse.bind(undefined, indent)), seq(
                new token.PunctuatorToken(null, ','),
                new token.WhitespaceToken(null, ' '))),
            new token.PunctuatorToken(null, ')'),
            new token.WhitespaceToken(null, ' '),
            new token.PunctuatorToken(null, '{'),
            new token.LineTerminatorToken(null, '\n'),
            stream.concata.apply(undefined, node.body.map(_unparse.bind(undefined, indent + 4))),
            ind,
            new token.PunctuatorToken(null, '}'));
        
    case 'FunctionDeclaration':
        return seq(
            ind,
            new token.KeywordToken(new position.SourceLocation(node.loc.start, null), 'function'),
            (node.id ?
                seq(
                    new token.WhitespaceToken(null, ' '),
                    _unparse(indent, node.id)):
                stream.end),
            new token.PunctuatorToken(null, '('),
            joins(node.params.map(_unparse.bind(undefined, indent)), seq(
                new token.PunctuatorToken(null, ','),
                new token.WhitespaceToken(null, ' '))),
            new token.PunctuatorToken(null, ')'),
            new token.WhitespaceToken(null, ' '),
            new token.PunctuatorToken(null, '{'),
            new token.LineTerminatorToken(null, '\n'),
            stream.concata.apply(undefined, node.body.map(_unparse.bind(undefined, indent + 4))),
            ind,
            new token.PunctuatorToken(null, '}'));

// Program
    case 'Program':
        return stream.concata.apply(undefined, node.body.map(_unparse.bind(undefined, indent)));

// Declarations
    case 'VariableDeclaration':
        return seq(
            ind,
            new token.KeywordToken(new position.SourceLocation(node.loc.start, null), 'var'),
            new token.WhitespaceToken(null, ' '),
            join(node.declarations.map(_unparse.bind(undefined, indent)), new token.PunctuatorToken(null, ',')),
            new token.PunctuatorToken(null, ';'),
            new token.LineTerminatorToken(null, '\n'));
        
    case 'VariableDeclarator':
        return stream.concat(_unparse(indent, node.id), (node.init ?
            seq(new token.WhitespaceToken(null, ' '), new token.PunctuatorToken(null, '='), new token.WhitespaceToken(null, ' '), _unparse(indent, node.init)):
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

var unparse = function(node) {
    return _unparse(0, node);
};


return {
    'unparse': unparse
};

});