Router.map( function(){
  this.route('editor',{
    waitOn: function(){
      return Meteor.subscribe('atom.deep','2g3H6zFMZCsS9BXit');
    },
    data: function(){
      
      editorModel = new EditorModel({
        editable: true
      });

      return {
        atom: new AtomModel('2g3H6zFMZCsS9BXit')
      };
    }
  });
});
