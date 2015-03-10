/**
 *
 *  {
 *    _id: <group name>,
 *    distribution: [ { _userId: <user id>, shares: <Number> }, ... ],
 *    sum: <Number>
 *  }
 *
 */


Owners = new Meteor.Collection('shares', {
  schema: new SimpleSchema({
    distribution: {
      type: [Object],
      autoValue: function(){
        if( !this.isSet )
          return [{ _userId: Meteor.userId(), shares: 1 }];
      }
    },
    "distribution.$._userId":{
      type: String
    },
    "distribution.$.shares":{
      type: Number,
      defaultValue: 1
    },
    ctx: {
      type: String,
      blackbox: true,
      autoValue: function(){
        return Atoms.insert( new LLMD.Atom('seq') );
      }
    },
    deligations: {
      type: String,
      autoValue: function(){
        return Atoms.insert( new LLMD.Atom('seq') );
      }
    },
    'deligations.$': {
      type: Object,
      blackbox: true
    },
    sum: {
      type: Number,
      autoValue: function(){
        var sum = 0;
        this.field('distribution').value.forEach( function( e ){
          sum += e.shares;
        });
        return sum;
      
      }
    }
  })
});


