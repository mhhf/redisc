Template.lab.helpers({
  
});

Template.lab.events = {
  "click .compile-btn": function( e, t ){
    
    var val = t.data._tmp.editor.getValue();
    
    var parser = Jison.Parser( val );
    window.parser = parser;

  }
}

Template.lab.created = function(){
  
  this.data._tmp = {}; 
  
}

Template.lab.rendered = function(){
  
  this.data._tmp.editor = CodeMirror(this.find('#editor'),{
    value: '',
    lineNumbers: true,
    lines: 10,
    dragDrop: false
  });

};
