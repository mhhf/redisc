Meteor.methods({
  
  "groups.create": function(o){
    // { name: <name> [, shares: <Number> ] }
    
    var group = Shares.findOne({ _id: o.name });
    if( group ) return false;
    
    var g = { _id: o.name };
    if( typeof o.shares == "number" ) g.distribution = [{ shares: o.shares, _userId: Meteor.userId() }];
    Shares.insert( g );
    Meteor.users.update({_id: this.userId}, {$push: {"profile.groups": o.name }});
    
    return true;
    
  },
  "groups.transact": function(o){
    // { balance: <Number>, to: <_userId> }
    
  }
  
});


Meteor.publish('user.groups', function( ids ){
  var usr = Meteor.users.findOne({ _id: this.userId })
  return Shares.find({ _id: { $in: usr.profile.groups }});
});
