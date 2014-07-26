Schemas = {
  Common: {
    Owner: new SimpleSchema({
      owner: {
        type: Object
      },
      'owner.name': {
        type: String,
        autoValue: function(  ){
          if( this.isInsert ) {
            return Meteor.user().username
          }
        }
      },
      'owner._id': {
        type: String,
        autoValue: function(  ){
          if( this.isInsert ) {
            return Meteor.userId()
          }
        }
      }
    }),
    Common: new SimpleSchema({
      name: {
        type: String
      },
      description: {
        type: String
      },
      language: {
        type: String,
        defaultValue: 'en'
      },
      public: {
        type: Boolean,
        defaultValue: false
      }
    }),
    Git: new SimpleSchema({
      hash: {
        type: String,
        autoValue: function(){
          if( this.isInsert ) {
            var _id = this.field('owner').value._id;
            var name = this.field('name').value;
            var lang = this.field('language').value;
            var hash = _id+'_'+name+'_'+lang;
            return hash;
          }
        }
      },
      head: {
        type: [Object],
        autoValue: function(){
          if( this.isInsert ) {
            var path = process.env.LLWD+this.field('hash').value;
            Git.init( this.field('hash').value );
            return [];
          }
        }
      },
      'head.$': {
        type: Object,
        blackbox: true
      }
    }),
    Stars: new SimpleSchema({
      stars: {
        type: [String],
        defaultValue: []
      }
    }),
    LLMD: new SimpleSchema({
      ast: {
        type: [Object],
        defaultValue: []
      },
      'ast.$': {
        type: Object,
        blackbox: true
      },
      ctx: {
        type: Object,
        blackbox: true,
        defaultValue: {}
      }
    })
  }
}

ActivityInterface = {
  schema: new SimpleSchema({
    activity: {
      type: [Object],
      defaultValue: [],
    },
    'activity.$.user': {
      type: Object
    },
    'activity.$.user.name': {
      type: String,
      autoValue: function(){
        return Meteor.user().username
      }
    },
    'activity.$.user._id': {
      type: String,
      autoValue: function(){
        return Meteor.userId();
      }
    },
    'activity.$.date': {
      type: Date,
      autoValue: function(){
        return new Date();
      }
    },
    'activity.$.type': {
      type: String
    },
    'activity.$.msg': {
      type: String
    }
  }),
  
  apply: function( o ){
    
    o.log = function( type, msg ){
      this.Collection.update({ _id: this.ele._id }, {
        $push: {
          activity: {
            type: type,
            msg: msg
          }
        }
      });
    };
    
  }
}
