LLMD.registerPackage("if", {
  shema: [
    LLMD.AtomSchema,
    {
      c: {
        // [TODO] - expr
        type: String,
        defaultValue: 'true'
      },
      t: {
        type: [Object],
        defaultValue: []
      },
      't.$': {
        type: Object,
        blackbox: true
      },
      f: {
        type: [Object],
        defaultValue: []
      },
      'f.$': {
        type: Object,
        blackbox: true
      }
    }
  ],
  nested:['t','f'],
  dataFilter: function( params, rawData ){
    this.c; // condition
    this.t = []; // condition is true block 
    this.f = []; // condition is false block
    
    var bool = true;
    
    // scans the body of the block for if/ else blocks
    for (var i=0; i < rawData.length; i++) {
      
      if(rawData[i].key == 'else') {
        bool = false;
        continue;
      }
      
      // interpret as markdown
      if( !rawData[i].name ) rawData[i].name = 'md';
      
      if( bool ) {
        this.t.push(rawData[i])
      } else {
        this.f.push(rawData[i])
      }
      
    }
    this.t = cleanBlocks(this.t);
    this.f = cleanBlocks(this.f);
    
    // TODO - check if condition has to be an expr?
    if( !params || params.length>1 ) throw new Error('no or corrupt condition given')
    
    this.c = params && params[0] || true;
  }
});

// [TODO] - think about a better solution to bind rows of md blocks
var cleanBlocks = function( bs ){
  
  var blocks = [];
  var l;
  if( 0 in bs )
    l = bs[0];

  for(var i = 1; i<bs.length; i++) {
    if( ( !bs[i]['name'] || bs[i]['name'] == "md" ) &&
         ( !l['name'] || l['name'] == "md" ) && (l.name = "md")) {
        l['data'] += bs[i]['data'];
    } else {
      blocks.push(l)
      l = bs[i];
    }
  }
  
  if( l && l.name && l.name != 'md' || l && l.name == 'md' && !l.data.match(/^\s*$/) )
    blocks.push(l);
  return blocks;
}


LLMD.registerPackage('seq', {
  shema: [
    LLMD.AtomSchema,
    {
      data: {
        type: [Object],
        defaultValue: []
      },
      'data.$': {
        type: Object,
        blackbox: true
      }
    }
  ],
  nested: ['data']
});


LLMD.registerPackage('string', {
  shema: [
    LLMD.AtomSchema,
    {
      value: {
        type: String,
        defaultValue: ''
      }
    }
  ]
});

// has value to be nested
LLMD.registerPackage('name', {
  shema: [
    LLMD.AtomSchema,
    {
      key: {
        type: String,
        defaultValue: ''
      },
      value: {
        type: [ Object ],
        blackbox: true,
        defaultValue: [] 
      },
      'value.$': {
        type: Object,
        blackbox: true
      }
    }
  ],
  nested: ['value']
});

// LLMD.registerPackage('diff', {
//   init: function(){
//     return {
//       name:'diff',
//       type: '',
//       new: '',
//       old: '',
//       parents: []
//     };
//   },
//   nested: ['new','old']
//   
// });
