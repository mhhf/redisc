var Parser = Npm.require('jison').Parser;
var Lexer = Npm.require('lex');

Meteor.methods({
  'lang.parse': function( lang ){
    
    var parser = Parser(lang);
    
    
    return parser.parse("1+2");
  }

});

