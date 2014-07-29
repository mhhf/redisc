

if (Package.ui) {
  var UI = Package.ui.UI;
  var HTML = Package.htmljs.HTML; // implied by `ui`
  // Package.ui.UI.registerHelper('llmd', UI.block(function () {
  //   var self = this;
  //   console.log(this);
  //   return function () {
  //     var text = UI.toRawText(self.__content, self /*parentComponent*/);
  //     
  //     var dot = text.match(/\[dot\]((.|\n)*?)\[\/dot\]/);
  //     
  //     if( dot ) {
  //       
  //       var link = "https://chart.googleapis.com/chart?chof=png&cht=gv&chl="+ encodeURIComponent( dot[1] );
  //       
  //       var image = "![graphviz]("+link+")"
  //   
  //       text = text.replace(dot[0], image);
  //     }
  //     
  //     
  //     var html = marked(text);
  //     
  //     return HTML.Raw( html );
  //   };
  // }));
  
}

Template.llmd.rendered = function(){
 if( MathJax ) MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}

Template.llmd.helpers({
  getData: function(){
    var text = this.atom.data;
    
    
    var dot = text.match(/\{\{#dot\}\}((.|\n)*?)\{\{\/dot\}\}/);

    if( dot ) {

      var link = "https://chart.googleapis.com/chart?chof=png&cht=gv&chl="+ escape( dot[1] );

      var image = "![graphviz]("+link+")"

  text = text.replace(dot[0], image);
    }


    var html = marked(text);
    
    
    // var HTML = Package.htmljs.HTML; // implied by `ui`
    // return HTML.Raw( html );
    return html;
  }
});
