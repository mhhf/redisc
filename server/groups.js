// [TODO] - not atomic/ not secure (crypto)
Meteor.methods({
  
  "owner.create": function(o){
    // { name: <name> [, shares: <Number> ] }
    console.log('creating group', this.userId );
    
    var group = Owners.findOne({ _id: o.name });
    console.log(group);
    if( group ) return false;
    
    var g = { _id: o.name };
    if( typeof o.shares == "number" ) g.distribution = [{ shares: o.shares, _userId: Meteor.userId() }];
    Owners.insert( g );
    Meteor.users.update({_id: this.userId}, {$push: {"profile.groups": o.name }});
    
    return true;
    
  },
  "owner.transact": function(o){
    // { amount: <Number>, to: <_userId> }
    
    console.log(o);
    
    // check user
    var usr = Meteor.users.findOne({ _id: o.to });
    if (!usr) return 410;
    
    // check group
    var g = Owners.findOne({ _id: o._groupId });
    if( !g ) return 411;
    
    var _senderId = this.userId;
    
    // check amount
    var own = _.find( g.distribution, function(e){ return e._userId === _senderId; } );
    
    if( !own || o.amount > own.balance ) return 412;
    
    var toSharesO = _.find( g.distribution, function(e){ return e._userId === o.to });
    
    own.shares -= o.amount;
    if( toSharesO ) {
      toSharesO.shares -=- o.amount;
    } else {
      g.distribution.push( { _userId: o.to, shares: o.amount } );
    }
    
    
    Owners.update({ _id: o._groupId },{$set: { distribution: g.distribution }})
    Meteor.users.update({_id: o.to},{$addToSet: { "profile.groups": o._groupId }})
    
   
    
    
    
  }
  
});


Meteor.publish('user.groups', function( ids ){
  var usr = Meteor.users.findOne({ _id: this.userId })
  return Owners.find({ _id: { $in: usr.profile.groups || [] }});
});

Meteor.publish('group', function( _id ){
  return Owners.find({ _id: _id});
});
