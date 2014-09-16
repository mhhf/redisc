LLMD.compileJson = function( json ){
  
  var a = new AtomModel( new LLMD.Atom('name',{key:'model'}) );
  json2atom( json, a )
  
  console.log( a.getId() );

}

json2atom = function( json, parent ){
  
  if( typeof json == 'object' ) {
    
    if( json.length == undefined ) {
      // object
      _.each(json, function( v, k ) {
        
        var name = parent.push( new LLMD.Atom( 'name', { key: k } ) );
        if( v ) {
          json2atom(v, name);
        }
        
      });
      
    } else {
      // array
      var seq = parent.push( new LLMD.Atom('seq') );
      _.each(json, function( v ){
        json2atom( v, seq );
      });
    }// if array or atom

  } else if( typeof json == 'string' || typeof json == 'number' ) {
    parent.push( new LLMD.Atom( 'string', {value: json} ) );
  } else {
    throw new Error('type '+(typeof json)+' not handled');
  }
  
}
