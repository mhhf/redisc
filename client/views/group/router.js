Router.map( function(){
  
  this.route('groupTransact', {
    path: '/group/:_id/transact',
    waitOn: function(){
      return Meteor.subscribe('group', this.params._id);
    },
    data: function(){
      return { 
        group: Owners.findOne({ _id: this.params._id })
      }
    }
  });

});
