Router.map( function(){
  this.route('editor',{
    waitOn: function(){
      return Meteor.subscribe('atom.deep','yKLZT5xSYu9JHbLoc');
    },
    data: function(){
      return {
        atom: new AtomModel('yKLZT5xSYu9JHbLoc')
      };
    }
  });
});
