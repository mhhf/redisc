// newAtom(type)



// [TODO] - render with llmd
MDPlugin = BasicPlugin.extend({
  render: function(){
    var divWrapper = document.createElement('div');
    divWrapper.innerHTML = marked( this.data );
    return divWrapper;
  }
});

PluginHandler.registerPlugin( "md", MDPlugin );




Template.llmd_md_edit.rendered = function(){
  var data = this.data.atom.data;
  var editor = CodeMirror(this.find('.editor'),{
    value: data || '',
    mode:  "markdown",
    lineNumbers: true,
    extraKeys: {"Ctrl-J": "autocomplete"},
    lines: 10,
    autofocus: true
  });
  
  this.data.buildAtom = function(){
    return {
      name: 'md',
      data: editor.getValue()
    }
  }
  
  
}

Template.llmd_md_ast.rendered = function(){
}

Template.llmd_md_ast.helpers({
  getData: function(){
    var dot = this.atom.data.match(/\[dot\]((.|\n)*?)\[\/dot\]/);
    
    if(dot) {
      var data = this.atom.data;
      var link = "https://chart.googleapis.com/chart?chof=png&cht=gv&chl="+ encodeURIComponent( dot[1] );
      var image = "![graphviz]("+link+")"
      return data.replace(dot[0], image);
    } else {
      return this.atom.data;
    }
  
  console.log(dot[1]);
  }
});
