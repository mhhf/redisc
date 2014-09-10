Router.map( function(){
  
  this.route('group', {
    path: '/group/:_id',
    waitOn: function(){
      var o = Owners.findOne();
      var o = Atoms.findOne();
      return Meteor.subscribe('group', this.params._id);
    },
    data: function(){
      return { 
        group: Owners.findOne({ _id: this.params._id })
      }
    }
  });
  
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
