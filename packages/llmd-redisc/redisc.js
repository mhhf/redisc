// [TODO] - refactor nested to children
LLMD.registerPackage("redisc", {
  shema: [
  LLMD.AtomSchema,
  {    
    data: {
      type: String,
      defaultValue: ''
    },
    title: {
      type: String,
      defaultValue: ''
    },
    code: {
      type: String,
      defaultValue: ''
    },
    nested: {
      type: [String],
      defaultValue: []
    },
    comments: {
      type: Number,
      defaultValue: 0
    },
    tags: {
      type: [String],
      defaultValue: []
    },
    root: {
      type: String,
      defaultValue: ''
    },
    createdOn: {
      type: Date,
      autoValue: function(){
        return new Date();
      }
    }
  }],
  nested: ['nested'],
  
  // is fired on an atom inside the collection
  preprocess: function( ast, cb ){
    
    ast.updatedOn = new Date();
    
    if( ast.root ) {
      Atoms.update({_id: ast.root},{ 
        $set: { updatedOn: new Date()},
        $inc: { comments: 1 }
      });
    } else {
      ast.comments += 1;
    }
     
    // each tag
    ast.tags && ast.tags.forEach( function( tag ){
      var tagO = GlobalTags.findOne({ _id: tag });
      if( !tagO ) GlobalTags.insert({ _id: tag, _remoteIds: [ ast._id ], rate:1 });
      else if( tagO._remoteIds.indexOf( ast._id ) == -1 ) {
        GlobalTags.update({_id: tag}, { 
          $addToSet:{ _remoteIds: ast._id }, 
          $inc: { rate: 1 } 
        });
      }
     
    });
    
    cb( null, ast );
    
  }
});
