ACLInterface = {
  schema: new SimpleSchema({
    acl: {
      type: [Object],
      // Makes the creator an admin
      autoValue: function(){
        if( this.isInsert ) {
          return [{
            _id: Meteor.userId(),
            name: Meteor.user().username,
            right: 'admin'
          }];
        }
      }
    },
    'acl.$._id': {
      type: String
    },
    'acl.$.name': {
      type: String
    },
    'acl.$.right': {
      type: String
    }
  }),
  
  apply: function( o ){
    
    o.check = function( right ){
      return checkUser.apply( this, [Meteor.userId(), right] );
    };
    o.checkUser = checkUser;
    o.addUser = addUser;
    o.removeUser = removeUser;
  }
}


var checkUser = function( userId, right ){
  var userAcl = _.find( this.ele.acl, function(e){
    return e._id == userId;
  });
  if( !userAcl ) return false;

  if( !userRightToNumber( userAcl.right ) >= userRightToNumber( right ) )
    throw new Error('User dont have the permission to do this action');

  return this;
}

var addUser = function( username, right, cb ){

  // look for user in the database
  var user = Meteor.users.findOne({ username: username });

  // if no user found or user is self then exit
  if( !user || user._id == Meteor.userId() ) 
    throw new Error('User not found');

  var acl = this.ele.acl;
  if( _.find( this.ele.acl, function(e){ return e._id == user._id; }) ) {
    acl = _.filter( this.ele.acl, function(e){ return e._id != user._id; });
  }

  acl.push({
    _id: user._id,
    name: user.username,
    right: right
  });
  
  this.Collection.update({_id: this.ele._id }, {$set: {acl: acl }});

  return this;
}

var removeUser = function( userId ){

  var acl = _.filter(this.ele.acl, function(e){ return e._id != userId; });
  
  this.Collection.update({ _id: this.ele._id }, {$set: {acl: acl }});

  return this;
}

var userRightToNumber = function( right ){
  return right=='admin'?3:(right=='write'?2:1);
}
