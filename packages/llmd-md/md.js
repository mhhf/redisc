LLMD.registerPackage("md", {
  init: function(){
    this.data = '';
  },
  // dataFilter: function( params, rawData ){
  //   var data = "";
  //     
  //   if( rawData.length && rawData.length>0 ) {
  //     for( var i in rawData ) {
  //       data+= rawData[i].data;
  //     }
  //   }
  //   
  //   return data;
  // },
  preprocess: function( ast, cb ){
    
      cb( null, ast );
    
  }
});
