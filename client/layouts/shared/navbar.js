Template.navbar.helpers({
  popularTags: function(){
    return _.pluck( GlobalTags.find({},{sort:{rate:-1}, limit: 5 }).fetch() ,'_id');
  }
});
