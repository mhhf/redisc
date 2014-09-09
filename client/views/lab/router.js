Router.map( function(){
  this.route('editor',{
    waitOn: function(){
      return Meteor.subscribe('atom.deep','wGoCkjzWbrs8Gn9ij');
    },
    data: function(){
      return {
        atom: new AtomModel('wGoCkjzWbrs8Gn9ij')
      };
    }
  });
});
