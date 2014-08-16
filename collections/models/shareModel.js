/**
 *
 *  {
 *    _id: <group name>,
 *    distribution: [ { _userId: <user id>, shares: <Number> }, ... ],
 *    sum: <Number>
 *  }
 *
 */


Shares = new Meteor.Collection('shares', {
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


