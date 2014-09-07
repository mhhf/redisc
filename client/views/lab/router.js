Router.map( function(){
  this.route('editor',{
    waitOn: function(){
      return Meteor.subscribe('atom.deep','WFPraWgux4Q9sM3Sh');
    },
    data: function(){
      return {
        atom: new AtomModel('WFPraWgux4Q9sM3Sh')
      };
    }
  });
});
