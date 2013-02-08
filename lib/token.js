/**
 * @fileOverview Unparser tokens.
 */
define(['ecma/lex/token'], function(token){
"use strict";

/**
 * 
 */
var StringToken = function(loc, value) {
    token.StringToken.call(this, loc, value);
};
StringToken.prototype = new token.StringToken;

StringToken.prototype.toString = function() {
    return (this.value.indexOf('"') !== -1 ?
        "'" + this.value + "'" :
        '"' + this.value + '"');
};

/**
 * 
 */
var NumberToken = function(loc, value) {
    token.NumberToken.call(this, loc, value);
};
NumberToken.prototype = new token.NumberToken;

NumberToken.prototype.toString = function() {
    return this.value.toString();
};

/**
 * 
 */
var RegularExpressionToken = function(loc, value) {
    token.RegularExpressionToken.call(this, loc, value);
};
RegularExpressionToken.prototype = new token.RegularExpressionToken;

RegularExpressionToken.prototype.toString = function() {
    return this.value.toString();
};

/**
 * 
 */
var BooleanToken = function(loc, value) {
    token.BooleanToken.call(this, loc, value);
};
BooleanToken.prototype = new token.BooleanToken;

BooleanToken.prototype.toString = function() {
    return this.value.toString();
};

/**
 * 
 */
var NullToken = function(loc, value) {
    token.NullToken.call(this, loc, value);
};
NullToken.prototype = new token.NullToken;

NullToken.prototype.toString = function() {
    return 'null';
};

/**
 * 
 */
var IdentifierToken = function(loc, value) {
    token.IdentifierToken.call(this, loc, value);
};
IdentifierToken.prototype = new token.IdentifierToken;

IdentifierToken.prototype.toString = function() {
    return this.value;
};

/**
 * 
 */
var KeywordToken = function(loc, value) {
    token.KeywordToken.call(this, loc, value);
};
KeywordToken.prototype = new token.KeywordToken;

KeywordToken.prototype.toString = function() {
    return this.value;
};

/**
 * 
 */
var PunctuatorToken = function(loc, value) {
    token.PunctuatorToken.call(this, loc, value);
};
PunctuatorToken.prototype = new token.PunctuatorToken;

PunctuatorToken.prototype.toString = function() {
    return this.value;
};


var CommentToken = function(loc, value) {
    Token.call(this, loc, value);
};
CommentToken.prototype = new token.CommentToken;
CommentToken.prototype.type = "Comment";


var WhitespaceToken = function(loc, value) {
    Token.call(this, loc, value);
};
WhitespaceToken.prototype = new token.WhitespaceToken;
WhitespaceToken.prototype.type = "Whitespace";


var LineTerminatorToken = function(loc, value) {
    Token.call(this, loc, value);
};
LineTerminatorToken.prototype = new token.LineTerminatorToken;
LineTerminatorToken.prototype.type = "LineTerminator";


/* Export
 ******************************************************************************/
return {
    'StringToken': StringToken,
    'NumberToken': NumberToken,
    'RegularExpressionToken': RegularExpressionToken,
    'BooleanToken': BooleanToken,
    'NullToken': NullToken,
    
    'IdentifierToken': IdentifierToken,
    'KeywordToken': KeywordToken,
    'PunctuatorToken': PunctuatorToken,
    
    'CommentToken': token.CommentToken,
    'WhitespaceToken': token.WhitespaceToken,
    'LineTerminatorToken': token.LineTerminatorToken
};

});