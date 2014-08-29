Template.userGroups.helpers({
  groups: function(){
    return Owners.find();
  },
  getOwnedShares: function(){
    return _.find(this.distribution, function(e){ return e._userId == Meteor.userId(); }).shares;
  },
  getOwnedPercent: function(){
    var own = _.find(this.distribution, function(e){ return e._userId == Meteor.userId(); }).shares;
    return Math.floor( (own/this.sum)*10000 )/100 + "%";
  },
  userIsGroup: function(){
    return Meteor.user().profile.id == this._id;
  }

});

Template.userGroups.events = {
  "submit": function( e, t ){
    e.preventDefault();
    
    var name = t.find('input[name=name]').value;
    var shares = -(-t.find('input[name=shares]').value);
    
    Meteor.call( 'owner.create', {
      name: name,
      shares: shares
    }, function( e, r ){
      
    });
    
  }
}
