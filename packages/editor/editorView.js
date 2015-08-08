var state = {
  dep:	new Deps.Dependency,
  val: 'editor', // editor, split, preview
  get: function(){
    this.dep.depend();
    return this.val;
  },
  set: function( val ){
    this.dep.changed();
    this.val = val;
  }
}
var editor;

var changed = false;

Template.editorView.helpers({
  isActive: function( s ){
    return (state.get() === s)? 'active': '';
  },
  getEditorClass: function(){
    switch( state.get() ){
      case 'editor': return 'col-md-12';
      case 'split': return 'col-md-6';
      case 'preview': return 'hide';
    }
  },
  getViewClass: function(){
    switch( state.get() ){
      case 'editor': return 'hide';
      case 'split': return 'col-md-6';
      case 'preview': return 'col-md-12';
    }
  },
   
});
Template.editorView.rendered = function(){
  
  editor = CodeMirror(this.find('#editor'),{
    value: this.data.value || '',
    mode:  "markdown",
    lineNumbers: true,
    extraKeys: {"Ctrl-J": "autocomplete"},
    lines: 10,
    gutters: ['close']
  });
  
  var previewWrapper = $('#preview-md');
  
  var lastChange;
  editor.on('change', function(i){
    if( state.val !== 'editor' ) {
      previewWrapper.html( marked( i.getValue() ) );
    }
    if( !changed ) {
      $('.save-btn').addClass('changed')
    }
    
  });
};

Template.editorView.events = {
  "click button.editorView": function(e,t){
    e.preventDefault();
    
    console.log();
    
    var data = editor.getValue()+"\n";
    var html = '';
    if( this.llmdEngine ) {
      buildLLMDPreview(data, {}, 'en', function(err, data){
        var comp = UI.renderWithData(Template.projectAstView, {ast: data})
        
        $('#preview-md').empty();
      
        UI.insert( comp, $('#preview-md')[0] );
        var target = e.currentTarget.dataset.target;
        state.set( target );
      });
    } else {
      html = marked( data );
      $('#preview-md').html( html );
      var target = e.currentTarget.dataset.target;
      state.set( target );
    }
  }
}


buildLLMDPreview = function(data, ctx, lang, cb ){
  
  // Initialize the Parser with the context
  LlmdParser.yy.ctx = ctx;
  LlmdParser.yy.lang = lang;
  LlmdParser.yy.llmd = new LLMD();
  
  
  var fileAST = LlmdParser.parse( data+"\n" ); 

  LLMD.processNestedASTASYNC( fileAST, cb );

}

