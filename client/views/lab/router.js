Router.map( function(){
  
  this.route('editor',{
    waitOn: function(){
      return Meteor.subscribe('atom.deep','brRpZeFwbZrYMcLdd');
    },
    data: function(){
      return {
        atom: new AtomModel('brRpZeFwbZrYMcLdd')
      };
    }
  });
  

  this.route('editAtom',{
    path: 'e/:_id',
    template: 'editor',
    waitOn: function(){
      var a = Atoms.find().count();
      var s = Meteor.subscribe( 'atom.deep', this.params._id, a )
      return s;
    },
    data: function(){
      return {
        atom: new AtomModel( this.params._id )
      };
    }
  });
  

});
