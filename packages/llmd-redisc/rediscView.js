// newAtom(type)



RediscPlugin = BasicPlugin.extend({
  render: function(){
    var divWrapper = document.createElement('div');
    divWrapper.innerHTML = marked( this.data );
    return divWrapper;
  }
});

PluginHandler.registerPlugin( "md", RediscPlugin );


Template.llmd_redisc_edit.events = {
  "dragenter .dragWrapper": function(e,t){
    e.stopPropagation();
    e.preventDefault(); 
    
    // $('.dragWrapper').addClass('hover');
    $('.dragMask').addClass('show');
    // console.log('e');
  },
  "dragleave .dragMask": function(e,t){
    e.stopPropagation();
    e.preventDefault(); 
    
    $('.dragMask').removeClass('show');
    console.log('l');
  },
  "dragover .dragWrapper": function(e,t){
    e.stopPropagation();
    e.preventDefault(); 
  },
  "drop .dragMask": function(e,t){
    
    e.stopPropagation();
    e.preventDefault(); 
    
    $('.dragMask').addClass('upload');
    
    var files = e.originalEvent.dataTransfer.files;
    var file = new FS.File(files[0]);
    
    var i = Files.insert( file );
    Meteor.subscribe('file',i._id);
    
    Deps.autorun( function( c ){
      
      var f = Files.findOne(i._id); 
      var url = f.url();
      if(url) {
        $('.dragMask').removeClass('show');
        $('.dragMask').removeClass('upload');
        window.f = f;
        var editor = t.data._dataEditor;
        var img = "\n![File](https://ll-poc.s3.amazonaws.com/f/"+f.copies.files.key+")";
        editor.replaceRange( img, CodeMirror.Pos(editor.lastLine()) );
        
        c.stop();
      }
      
    })
    
    // image.set(i._id);
    // console.log(image.get());
  },
  "click .btn.editorView": function(e,t){
    e.preventDefault();
    
    var target = e.currentTarget.dataset.target;
    
    if( target != this._active ) {
      this._active = target;
      this._editorDeps.changed();
      this._valueDeps.changed();
    }
    
    
  }
  
}

Template.llmd_redisc_edit.created = function(){
  
  this.data._editorDeps = new Deps.Dependency;
  this.data._valueDeps = new Deps.Dependency;
  this.data._active = 'editor';
  this.data._data = '';
  this.data._updateInterval;
  this.data._lastEdit;
  
}


Template.llmd_redisc_edit.config = function () {
  var self = this;
  return function(editor) {
    console.log(this);
    self._ace = editor;
    editor.setTheme('ace/theme/monokai');
    editor.getSession().setMode('ace/mode/markdown');
    editor.setShowPrintMargin(false);
    editor.getSession().setUseWrapMode(true);
    editor.on('change', function( e ){
      self._data = editor.getValue();
      if( !self._updateInterval ) {
        self._valueDeps.changed();
        self._updateInterval = setInterval( function(){
          self._valueDeps.changed();
          if(+new Date() - self._lastEdit > 1000 ) {
            clearInterval( self._updateInterval );
            self._updateInterval = null;
          }
        },1000);
      }
      self._lastEdit = +new Date(); 
    });
  }
};


var tags = [];
Template.llmd_redisc_edit.rendered = function(){
  
  var self = this;
  
  var atom = this.data.get && this.data.get();
  
  var data = ( atom && atom.data ) || ''; 
  this.data._data = data;
  // var code = ( this.data.atom && this.data.atom.code ) || ''; 
  // 
  // 
  
  
  var isReply = this.data.parents && this.data.parents.length != 0;
  var isRoot = !isReply || atom && atom.root == '';
  
  this.data._dataEditor = CodeMirror(this.find('#editor'),{
    value: data,
    mode:  "markdown",
    lineNumbers: true,
    lines: 10,
    dragDrop: false,
    autofocus: !isRoot,
    tabSize: 2,
    extraKeys: {Tab: function(cm) { cm.replaceSelection("  ", "end"); }}
  });
  
  this.data._dataEditor.on('cursorActivity', function( cm ){
    var line = cm.doc.getCursor().line;
    var numLines = cm.doc.lineCount();
    var nscroll = (line/numLines)
    var dh = $('#markdownWrapper').height() - 600;
    if( dh > 0)
      $('#preview-md').scrollTop( dh * nscroll  )
  })
  
  this.data._dataEditor.on('change', function(cm){
    self.data._data = cm.getValue();
    if( !self.data._updateInterval ) {
      self.data._valueDeps.changed();
      self.data._updateInterval = setInterval( function(){
        self.data._valueDeps.changed();
        if(+new Date() - self.data._lastEdit > 1000 ) {
          clearInterval( self.data._updateInterval );
          self.data._updateInterval = null;
        }
      },1000);
    }
    self.data._lastEdit = +new Date(); 
  });
  
  // var codeEditor = CodeMirror(this.find('.codeEditor'),{
  //   value: code,
  //   mode:  "javascript",
  //   theme: "monokai",
  //   lineNumbers: true,
  //   lines: 10
  // });
  
  $('select[name=tags]').selectize({
    create: true, 
    onChange: function(t){
      tags = t;
    }
  });
  
  this.data.buildAtom = function(){
    var title = self.find('input[name=title]') && self.find('input[name=title]').value;
    var owner = self.find('[name=owner] :checked').value;
    var rights = self.find('[name=rights]:checked').value;
    
    return {
      data: self.data._dataEditor.getValue(),
      // code: codeEditor.getValue(),
      tags: tags,
      title: title,
      owner: owner,
      _rights: rights
    }
  }
  
}

Template.llmd_redisc_edit.helpers({
  isOwner: function( atom ){
    return (atom.get().owner == this)?'selected':'';
  },
  checked: function( right ){
    var atom = this && this.get && this.get();
    return atom && atom._rights == right? 'checked':'';
  },
  onConnect: function(a,b){
    console.log( this._ace );
  },
  getEditorData: function(){
    this._valueDeps.depend();
    var self = this;
    return new function(){
      this.get= function(){
        return {data:self._data};
      }
    };
    
  },
  isRoot: function(){
    var atom = this && this.get && this.get();
    var isReply = this.parents && this.parents.length != 0;
    var isRoot = !isReply || atom && atom.root == '';
    return isRoot;
  },
  getId: function(){
    return this.get && this.get()._id || '';
  },
  getTitle: function(){
    var atom = this && this.get && this.get();
    return atom && atom.title;
  },
  getTags: function(){
    var atom = this && this.get && this.get();
    return atom && atom.tags || this.ctx;
  },
  getGlobalTags: function(){
    var atom = this && this.get && this.get();
    var selected = atom && atom.tags || this.ctx;
    var tags = _.pluck(GlobalTags.find().fetch(),'_id');
    return _.difference( tags, selected );
  },
  isActive: function( key ){
    this._editorDeps.depend();
    return this._active == key?'active':'';
  },
  getEditorClass: function(){
    this._editorDeps.depend();
    if( this._active == 'editor' ) {
      return 'full';
    } else if( this._active == 'split' ) {
      return 'split';
    } else {
      return 'none'
    }
  },
  getViewClass: function(){
    this._editorDeps.depend();
    if( this._active == 'preview' ) {
      return 'full';
    } else if( this._active == 'split' ) {
      return 'splitPreview';
    } else {
      return 'none'
    }
  },
  owners: function(){
    return Meteor.user().profile.groups;
  }
});

Template.llmd_redisc_ast.rendered = function(){
}

Template.llmd_redisc_ast.helpers({
});
