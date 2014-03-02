/*
 * THIS FILE IS AUTO GENERATED from 'lib/unparse.kep'
 * DO NOT EDIT
*/
define(["require", "exports", "nu-stream/stream", "ecma-ast/token", "ecma-ast/node"], (function(require, exports,
    stream, token, node) {
    "use strict";
    var NIL = stream["NIL"],
        cons = stream["cons"],
        unparse, slice = Array.prototype.slice,
        joins = (function(arr, joiner) {
            return ((!arr.length) ? NIL : ((arr.length === 1) ? arr[0] : stream.append(arr[0], stream.append(
                joiner, joins(arr.slice(1), joiner)))));
        }),
        join = (function(arr, joiner) {
            return joins(arr, cons(joiner, NIL));
        }),
        keyword = (function(x) {
            return new(token.KeywordToken)(null, x);
        }),
        lineTerminator = (function(x) {
            return new(token.LineTerminatorToken)(null, x);
        }),
        punctuator = (function(x) {
            return new(token.PunctuatorToken)(null, x);
        }),
        whitespace = (function(x) {
            return new(token.WhitespaceToken)(null, x);
        }),
        newLine = lineTerminator("\n"),
        space = whitespace(" "),
        seq = (function() {
            var args = arguments;
            if ((args.length === 0)) return NIL;
            var first = args[0],
                rest = seq.apply(undefined, slice.call(args, 1));
            if (((first === undefined) || stream.isEmpty(first))) return rest;
            else if (stream.isStream(first)) return stream.append(first, rest);
            else return stream.cons(first, rest);
        }),
        statement = (function() {
            var args = arguments;
            return seq(seq.apply(undefined, args), newLine);
        }),
        expression = (function() {
            var args = arguments;
            return seq.apply(undefined, args);
        }),
        declaration = (function() {
            var args = arguments;
            return seq.apply(undefined, args);
        }),
        clause = (function() {
            var args = arguments;
            return seq(seq.apply(undefined, args), newLine);
        }),
        value = (function() {
            var args = arguments;
            return seq.apply(undefined, args);
        }),
        identifier = (function(name) {
            return value(new(token.IdentifierToken)(null, name));
        }),
        string = (function(x) {
            return value(new(token.StringToken)(null, x));
        }),
        number = (function(x) {
            return value(new(token.NumberToken)(null, x));
        }),
        nil = (function(x) {
            return value(new(token.NullToken)(null, x));
        }),
        boolean = (function(x) {
            return value(new(token.BooleanToken)(null, x));
        }),
        regexp = (function(x) {
            return value(new(token.RegularExpressionToken)(null, x));
        }),
        program = (function(body) {
            return seq.apply(undefined, body);
        }),
        variableDeclaration = (function(declarations) {
            return statement(keyword("var"), space, join(declarations, punctuator(",")), punctuator(";"));
        }),
        variableDeclarator = (function(id, init) {
            return declaration(id, (init ? seq(space, punctuator("="), space, init) : NIL));
        }),
        functionExpression = (function(id, params, body) {
            return expression(punctuator("("), keyword("function"), (id ? seq(space, id) : NIL), punctuator(
                    "("), joins(params, seq(punctuator(","), space)), punctuator(")"), space, body,
                punctuator(")"));
        }),
        functionDeclaration = (function(id, params, body) {
            return declaration(keyword("function"), space, punctuator("("), joins(params, seq(punctuator(
                ","), space)), punctuator(")"), space, body);
        }),
        switchCase = (function(test, consequent) {
            return seq((test ? seq(keyword("case"), space, test) : keyword("default")), punctuator(":"),
                newLine, seq.apply(undefined, consequent));
        }),
        catchClause = (function(param, body) {
            return seq(keyword("catch"), punctuator("("), param, punctuator(")"), body);
        }),
        emptyStatement = (function() {
            return statement(punctuator(";"));
        }),
        debuggerStatement = (function() {
            return statement(keyword("debugger"), punctuator(";"));
        }),
        blockStatement = (function(body) {
            return statement(punctuator("{"), newLine, seq.apply(undefined, body), punctuator("}"));
        }),
        expressionStatement = (function(expression) {
            return statement(expression, punctuator(";"));
        }),
        ifStatement = (function(test, consequent, alternate) {
            return statement(keyword("if"), space, punctuator("("), test, punctuator(")"), consequent, ((!
                alternate) ? NIL : seq(keyword("else"), space, alternate)));
        }),
        labeledStatement = (function(label, body) {
            return statement(identifier(label), punctuator(":"), body);
        }),
        breakStatement = (function(label) {
            return statement(keyword("break"), space, label, punctuator(";"));
        }),
        continueStatement = (function(label) {
            return statement(keyword("continue"), space, label, punctuator(";"));
        }),
        withStatement = (function(obj, body) {
            return statement(keyword("with"), punctuator("("), obj, punctuator(")"), punctuator("{"), body,
                punctuator("}"));
        }),
        switchStatement = (function(discriminant, cases) {
            return statement(keyword("switch"), punctuator("("), discriminant, punctuator(")"), punctuator(
                "{"), newLine, seq.apply(undefined, cases), punctuator("}"));
        }),
        returnStatement = (function(argument) {
            return statement(keyword("return"), space, argument, punctuator(";"));
        }),
        throwStatement = (function(argument) {
            return statement(keyword("throw"), space, argument, punctuator(";"));
        }),
        tryStatement = (function(block, handler, finalizer) {
            return statement(keyword("try"), block, (handler ? handler : NIL), (finalizer ? seq(keyword(
                "finally"), finalizer) : NIL));
        }),
        whileStatement = (function(test, body) {
            return statement(keyword("while"), punctuator("("), test, punctuator(")"), body);
        }),
        doWhileStatement = (function(body, test) {
            return statement(keyword("do"), body, keyword("while"), punctuator("("), test, punctuator(")"),
                punctuator(";"));
        }),
        forDeclarationStatement = (function(init, test, update, body) {
            return statement(keyword("for"), punctuator("("), init, space, test, punctuator(";"), update,
                punctuator(")"), body);
        }),
        forStatement = (function(init, test, update, body) {
            return statement(keyword("for"), punctuator("("), init, punctuator(";"), test, punctuator(";"),
                update, punctuator(")"), body);
        }),
        forInStatement = (function(left, right) {
            return statement(keyword("for"), punctuator("("), node.left, punctuator("in"), node.right,
                punctuator(")"), node.body);
        }),
        thisExpression = (function() {
            return expression(keyword("this"));
        }),
        sequenceExpression = (function(expressions) {
            return expression(punctuator("("), join(expressions, punctuator(",")), punctuator(")"));
        }),
        unaryExpression = (function(op, arg) {
            return expression(punctuator("("), op, space, arg, punctuator(")"));
        }),
        binaryExpression = (function(op, left, right) {
            return expression(punctuator("("), left, space, op, space, right, punctuator(")"));
        }),
        updateExpression = (function(op, arg, prefix) {
            return (prefix ? expression(op, arg) : expression(arg, op));
        }),
        conditionalExpression = (function(test, consequent, alternate) {
            return expression(punctuator("("), test, space, punctuator("?"), space, consequent, space,
                punctuator(":"), space, alternate, punctuator(")"));
        }),
        newExpression = (function(callee, args) {
            return expression(keyword("new"), space, punctuator("("), callee, punctuator(")"), (args ? seq(
                punctuator("("), joins(args, seq(punctuator(","), space)), punctuator(")")) : NIL));
        }),
        callExpression = (function(callee, args) {
            return expression(callee, punctuator("("), joins(args, seq(punctuator(","), space)), punctuator(
                ")"));
        }),
        memberExpression = (function(obj, property, computed) {
            return (computed ? expression(obj, punctuator("["), property, punctuator("]")) : expression(obj,
                punctuator("."), property));
        }),
        arrayExpression = (function(elements) {
            return expression(punctuator("["), joins(elements, seq(punctuator(","), space)), punctuator("]"));
        }),
        objectExpression = (function(props) {
            return expression(punctuator("("), punctuator("{"), ((props && props.length) ? seq(newLine,
                    joins(props, seq(punctuator(","), newLine)), newLine) : NIL), punctuator("}"),
                punctuator(")"));
        }),
        objectGetExpression = (function(key, body) {
            return seq(identifier("get"), space, key, punctuator("("), punctuator(")"), space, body);
        }),
        objectSetExpression = (function(key, params, body) {
            return seq(identifier("set"), space, key, punctuator("("), seq.apply(undefined, params),
                punctuator(")"), space, body);
        }),
        objectValueExpression = (function(key, value) {
            return seq(key, punctuator(":"), space, value);
        }),
        rewrites = ({}),
        addRewrite = (function(type, check) {
            if (Array.isArray(type)) type.forEach((function(x) {
                return addRewrite(x, check);
            }));
            else(rewrites[type] = check);
        }),
        _unparse;
    addRewrite("SwitchCase", (function(node) {
        return switchCase((node.test ? _unparse(node.test) : null), _unparse(node.consequent));
    }));
    addRewrite("CatchClause", (function(node) {
        return catchClause(_unparse(node.param), _unparse(node.body));
    }));
    addRewrite("EmptyStatement", (function(node) {
        return emptyStatement();
    }));
    addRewrite("DebuggerStatement", (function(node) {
        return debuggerStatement();
    }));
    addRewrite("BlockStatement", (function(node) {
        return blockStatement(_unparse(node.body));
    }));
    addRewrite("ExpressionStatement", (function(node) {
        return expressionStatement(_unparse(node.expression));
    }));
    addRewrite("IfStatement", (function(node) {
        return ifStatement(_unparse(node.test), _unparse(node.consequent), (node.alternate ? _unparse(
            node.alternate) : null));
    }));
    addRewrite("LabeledStatement", (function(node) {
        return labeledStatement(_unparse(node.label), _unparse(node.body));
    }));
    addRewrite("BreakStatement", (function(node) {
        return breakStatement(_unparse(node.label));
    }));
    addRewrite("ContinueStatement", (function(node) {
        return continueStatement(_unparse(node.label));
    }));
    addRewrite("WithStatement", (function(node) {
        return withStatement(_unparse(node.object), _unparse(node.body));
    }));
    addRewrite("SwitchStatement", (function(node) {
        return switchStatement(_unparse(node.discriminant), node.cases.map(_unparse));
    }));
    addRewrite("ReturnStatement", (function(node) {
        return returnStatement(_unparse(node.argument));
    }));
    addRewrite("ThrowStatement", (function(node) {
        return throwStatement(_unparse(node.argument));
    }));
    addRewrite("TryStatement", (function(node) {
        return tryStatement(_unparse(node.block), (node.handler ? _unparse(node.handler) : null), (node
            .finalizer ? _unparse(node.finalizer) : null));
    }));
    addRewrite("WhileStatement", (function(node) {
        return whileStatement(_unparse(node.test), _unparse(node.body));
    }));
    addRewrite("DoWhileStatement", (function(node) {
        return doWhileStatement(_unparse(node.body), _unparse(node.test));
    }));
    addRewrite("ForStatement", (function(node) {
        var init = (node.init ? _unparse(node.init) : null),
            test = (node.test ? _unparse(node.test) : null),
            update = (node.update ? _unparse(node.update) : null),
            body = _unparse(node.body);
        return ((node.init && (node.init.type === "VariableDeclaration")) ? forDeclarationStatement(
            init, test, update, body) : forStatement(init, test, update, body));
    }));
    addRewrite("ForInStatement", (function(node) {
        return forInStatement(_unparse(node.left), _unparse(node.right), _unparse(node.body));
    }));
    addRewrite("ThisExpression", (function(node) {
        return thisExpression();
    }));
    addRewrite("SequenceExpression", (function(node) {
        return sequenceExpression(_unparse(node.expressions));
    }));
    addRewrite("UnaryExpression", (function(node) {
        return unaryExpression(punctuator(node.operator), _unparse(node.argument));
    }));
    addRewrite(["BinaryExpression", "LogicalExpression", "AssignmentExpression"], (function(node) {
        return binaryExpression(punctuator(node.operator), _unparse(node.left), _unparse(node.right));
    }));
    addRewrite("UpdateExpression", (function(node) {
        return updateExpression(punctuator(node.operator), _unparse(node.argument), node.prefix);
    }));
    addRewrite("ConditionalExpression", (function(node) {
        return conditionalExpression(_unparse(node.test), _unparse(node.consequent), _unparse(node.alternate));
    }));
    addRewrite("NewExpression", (function(node) {
        return newExpression(_unparse(node.callee), _unparse(node.args));
    }));
    addRewrite("CallExpression", (function(node) {
        return callExpression(_unparse(node.callee), node.args.map(_unparse));
    }));
    addRewrite("MemberExpression", (function(node) {
        return memberExpression(_unparse(node.object), _unparse(node.property), node.computed);
    }));
    addRewrite("ArrayExpression", (function(node) {
        return arrayExpression(_unparse(node.elements));
    }));
    addRewrite("ObjectExpression", (function(node) {
        return objectExpression(_unparse(node.properties));
    }));
    addRewrite("ObjectValue", (function(node) {
        return objectValueExpression(_unparse(node.key), _unparse(node.value));
    }));
    addRewrite("ObjectGetter", (function(node) {
        return objectGetExpression(_unparse(node.key), _unparse(node.value.body));
    }));
    addRewrite("ObjectSetter", (function(node) {
        return objectSetExpression(_unparse(node.key), _unparse(node.value.params), _unparse(node.value
            .body));
    }));
    addRewrite("FunctionExpression", (function(node) {
        return functionExpression(_unparse(node.id), _unparse(node.params), _unparse(node.body));
    }));
    addRewrite("FunctionDeclaration", (function(node) {
        return functionDeclaration(_unparse(node.id), _unparse(node.params), _unparse(node.body));
    }));
    addRewrite("Program", (function(node) {
        return program(node.body.map(_unparse));
    }));
    addRewrite("VariableDeclaration", (function(node) {
        return variableDeclaration(_unparse(node.declarations));
    }));
    addRewrite("VariableDeclarator", (function(node) {
        return variableDeclarator(_unparse(node.id), (node.init ? _unparse(node.init) : null));
    }));
    addRewrite("Identifier", (function(node) {
        return identifier(node.name);
    }));
    addRewrite("Literal", (function(node) {
        switch (node.kind) {
            case "string":
                return string(node.value);
            case "number":
                return number(node.value);
            case "null":
                return nil(node.value);
            case "boolean":
                return boolean(node.value);
            case "regexp":
                return regexp(node.value);
            default:
                return NIL;
        }
    }));
    (_unparse = (function(node) {
        if ((!node)) return NIL;
        if (Array.isArray(node)) return node.map(_unparse);
        var rewrite = rewrites[node.type];
        if (rewrite) return rewrite(node);
        return NIL;
    }));
    (unparse = _unparse);
    (exports.unparse = unparse);
}));