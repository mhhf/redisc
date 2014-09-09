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
      return Meteor.subscribe( 'atom.deep', this.params._id );
    },
    data: function(){
      return {
        atom: new AtomModel( this.params._id )
      };
    }
  });
  

});
