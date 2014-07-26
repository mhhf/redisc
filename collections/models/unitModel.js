

Units = new Meteor.Collection('units', {
  schema: new SimpleSchema([
  Schemas.Common.Owner,
  ACLInterface.schema,
  {
    _id: {
      type: String,
      autoValue: function(){
        if( this.isInsert ) {
          return Meteor.user().username+this.field('name').value.replace(/ /g,'_')
        }
      }
    },
    name: {
      type: String
    },
    nameId: {
      type: String,
      autoValue: function(){
        return this.field('name').value.replace(/ /g,'_');
      }
    },
    memberOf: {
      type:[String]
    },
    branch: {
      type: Object,
      autoValue: function(){
        if( this.isInsert ){
          
          var root = new LLMD.Atom('seq');
          var _rootId = Atoms.insert( root );

          var _commitId = Commits.insert({
            _rootId: _rootId,
            parent: null,
            _unitId: this.field('_id').value
          });
          
          var branch = LQTags.insert({
            name: 'master',
            type: 'branch',
            _commitId: _commitId,
            _unitId: this.field('_id').value
          });
          
          return {
            name: 'master',
            _id: branch 
          }
        }
      }
    },
    'branch.name': {
      type: String
    },
    'branch._id': {
      type: String
    }
  }
]) });
