Router.map( function(){
  this.route('editor',{
    waitOn: function(){
      return Meteor.subscribe('atom.deep','RduaxbNisfP5mE7wB');
    },
    data: function(){
      return {
        atom: new AtomModel('RduaxbNisfP5mE7wB')
      };
    }
  });
});
