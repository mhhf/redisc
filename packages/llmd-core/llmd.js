LLMD = function() {
  this.currentNode = null;
}

LLMD.packageTypes = {};

LLMD.Atom = function( name, parent ){
  
  var S = new SimpleSchema(
      LLMD.packageTypes[name].shema.concat({
        name: {
          type: String
        },
        meta: {
          type: Object
        },
        'meta.state': {
          type: String,
          defaultValue: 'init'
        },
        'meta.active': {
          type: Boolean,
          defaultValue: true
        },
        'meta.lock': {
          type: Boolean,
          defaultValue: false
        },
        _rights: {
          type: String,
          defaultValue: 'public'
        },
        _seedId: {
          type: String,
          defaultValue: CryptoJS.SHA3(Math.random()+''+Math.random(),{outputLength: 112}).toString()
        },
        _version: {
          type: String,
          defaultValue: '0.1.0'
        }
      }));
  
  _.extend(this, S.clean({ name: name }));
  
  if( parent ) {
    this._rights = parent._rights;
  }
  
}

LLMD.Type = function( name ){
  return LLMD.packageTypes[ name ];
}

LLMD.Package = function( name ){
  return LLMD.packageTypes[ name ];
}
 
// registers a new package
LLMD.registerPackage = function( name, o ){
  LLMD.packageTypes[name] = o;
}

LLMD.hasPreprocess = function( ast ){
  return (  ast.name && LLMD.packageTypes[ast.name] && LLMD.packageTypes[ast.name].preprocess );
}
LLMD.hasNested = function( ast ){
  return ( ast.name && LLMD.packageTypes[ast.name] && !!LLMD.packageTypes[ast.name].nested );
}

LLMD.eachNested = function( atom, f ){
  
  var nested = LLMD.packageTypes[atom.name].nested;
  
  for( var i in nested ) {
    f( atom[nested[i]], nested[i] );
  }
  
}

LLMD.applyNested = function( ast, f, cb ){
  var que = 0;
  var allDone = false;
  
  var nested = LLMD.packageTypes[ast.name].nested;
  
  for( var i in nested ) {
    que ++;
    f(ast[nested[i]], function(err, newAst){
      ast[nested[i]] = newAst;
      if( --que == 0 && allDone) 
        cb( null, ast );
    });
  }
  allDone = true;
  if( que == 0 ) 
    cb( null, ast );
  
}

// [TODO] - cleanup with subfunctions: eachNested
LLMD.preprocess = function( ast, cb ){
  var que = 0;
  var allDone = false;
  if( LLMD.hasPreprocess(ast) ) {
    if( LLMD.hasNested( ast ) ) {
      
      LLMD.applyNested( ast, LLMD.processNestedASTASYNC, function( err, ast ){
        LLMD.packageTypes[ast.name].preprocess(ast, cb);
      });
      
    } else {
      LLMD.packageTypes[ast.name].preprocess(ast, cb);
    }
  } else if( LLMD.hasNested( ast ) ) {
    LLMD.applyNested( ast, LLMD.processNestedASTASYNC, cb );
  } else {
    cb( null, ast );
  }
  
}


// [TODO] - cleanup: with promises?
LLMD.processNestedASTASYNC = function( ast, cb ){
  var retAST = [];
  var waitFor = 0;
  var allReady = false;
  
  // import files
  for (var i=0; i < ast.length; i++) {
    
    if( LLMD.hasPreprocess( ast[i] ) || LLMD.hasNested( ast[i] ) ) {
      
      waitFor ++;
      retAST.push(null);
      
      // Function Wrapper to perserve the right i value
      (function(i){
      
        LLMD.preprocess(ast[i], function(err,ret){
          // Insert at the right place
          retAST[i] = ret;
           
          // // Test if all preprocessor ready
          if( --waitFor == 0 && allReady ) {
            cb( null, _.flatten( retAST ) );
          }
        });
        
      })(i)
      
    } else {
      retAST.push(ast[i]);
    }
  }
  
  allReady = true;
  if( waitFor == 0 ) cb( null, _.flatten( retAST ) );
  
}


LLMD.prototype.filterRoot = function( rawData ) {
  // return rawData;
  return cleanBlocks( rawData );
}

LLMD.prototype.newBlock = function( name, params, data ) {
  var type;
  
  if( LLMD.packageTypes[name] ) {
    type = LLMD.packageTypes[name];
  }
  
  var node = new LLMD.Block( type, name, params, data );
  
  this.currentNode = node;
  return node;
}

// LLMD.prototype.newPackage = function( name, params ){
//   var type;
//   
//   if( LLMD.packageTypes[name] ) {
//     type = LLMD.packageTypes[name];
//   }
//   
//   return new LLMD.Package( type, name, params );
// }

LLMD.prototype.newExpr = function( key ){
  return new LLMD.Expr( key );
}

// LLMD.Block = function( type, name, params, data ){
//   this.name = name;
//   // if the Blocktype has a Data Filter, do the filter, otherwise return the piain data
//   var filteredData;
//   params = prefilterData.apply( this, [params] );
//   
//   if(type && type.dataFilter && (filteredData = type.dataFilter.apply( this, [params, data] ))) this.data = filteredData;
//   else if(!type || !type.dataFilter) this.data=data;
//   
//   return this;
// }

// example data filter for if
// LLMD.Package = function( type, name, data ) {
//   this.name = name;
//   data = prefilterData.apply( this, [data] );
//   
//   if(type && type.dataFilter && (filteredData = type.dataFilter.apply( this, [data] ))) this.data = filteredData;
//   else if(!type || !type.dataFilter) this.data=data;
//   
// }

LLMD.Expr = function( key ){
  this.name = 'expr';
  this.key = key;
}

var prefilterData = function( data ){
  var retData = [];
  for(var i in data) {
    if( data[i].name == 'ass' ) {
      if(data[i].value == 'true') this[data[i].key] = true;
      else if(data[i].value == 'false') this[data[i].key] = false;
      else this[data[i].key] = { name: 'expr', key: data[i].value }
    } else {
      retData.push( data[i] );
    }
  }
  return retData;
}

// [TODO] - only push l if !!l.data.match(/^\s*$/) 
var cleanBlocks = function( bs ){
  
  var blocks = [];
  var l;
  if( 0 in bs )
    l = bs[0];

  for(var i = 1; i<bs.length; i++) {
    if( ( !bs[i]['name'] || bs[i]['name'] == "md" ) && !bs[i].displaytime &&
         ( !l['name'] || l['name'] == "md" ) && !l.displaytime &&
         (l.name = "md") &&
         (typeof l.data == 'string') && (typeof bs[i].data == 'string')
         ) {
        l['data'] += bs[i]['data'];
    } else if( l && l.name && l.name != 'md' || l.name == 'md' && (typeof l.data == 'string' ) && !l.data.match(/^\s*$/) ) {
      blocks.push(l)
      l = bs[i];
    } else {
      l = bs[i];
    }
  }
  
  if( l && l.name && l.name != 'md' || l.name == 'md' && !l.data.match(/^\s*$/) ) {
    blocks.push(l);
  }
  return blocks;
}


LLMD.AtomSchema = {
  owner: {
    type: Object
  },
  "owner.name": {
    type: String,
    autoValue: function(){
      return Meteor.user().profile.name;
    }
  },
  "owner._id": {
    type: String,
    autoValue: function(){
      return Meteor.userId();
    }
  },
  updatedOn: {
    type: Date,
    autoValue: function(){
      return new Date();
    }
  },
  pro: {
    type: [String],
    defaultValue: []
  },
  con: {
    type: [String],
    defaultValue: [] 
  },
  score: {
    type: Number,
    defaultValue: 0
  },
};
