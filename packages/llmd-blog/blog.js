// [TODO] - refactor nested to children
LLMD.registerPackage("blog", {
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
    subtitle1: {
      type: String,
      defaultValue: ''
    },
    subtitle2: {
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
     
    cb( null, ast );
    
  }
});
