Template.groupTransact.helpers({
  getOwnedShares: function(){
    return _.find(this.group.distribution, function(e){ return e._userId == Meteor.userId(); }).shares;
  }
});

Template.groupTransact.events = {
  "submit": function(e,t){
    e.preventDefault();
    
    var amount = t.find('input[name=amount]').value;
    var _userId = t.find('input[name=user]').value;
    
    Meteor.call( 'groups.transact', {
      group: this._id,
      amount: amount,
      to: _userId
    }, function(e,r){
      console.log(e,r);
    } )
    
  }
}
