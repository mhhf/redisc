var compileAST = function( _id ){
  
  var atom = Atoms.findOne({ _id: _id });
  
  if( atom.name == 'seq' ) {
    console.log(atom);
    return _.map(atom.data, function(atom_id){ return compileAST( atom_id ) });
  } else if( LLMD.Type( atom.name ) && LLMD.Type( atom.name ).nested ) {
    var nested = LLMD.Type( atom.name ).nested;
    
    nested.forEach( function(k){
      if( atom[k] ) {
        atom[k] = compileAST( atom[k] );
      }
    });
    
    return atom;
  } else {
    return atom;
  }
  
}


Meteor.methods({
  "unit.compile": function( _id ){
    var rootId = Commits.findOne({ _id: _id }).rootId
  
    
    var ast = compileAST( rootId )
  
    return ast;
  
  },
  "ast.compile": function( _id ){
    var ast = compileAST( _id );
    return ast;
  },
  "commit.diff2": function( _cId1, _cId2 ){
    
    var diffAtom = Atoms.remove({ _id: 'diff_'+_cId1+'_'+_cId2 });
    if(diffAtom) return diffAtom._id;
    
    var commitOld = Commits.findOne({ _id: _cId1 });
    var commitNew = Commits.findOne({ _id: _cId2 });
    console.log(commitOld, commitNew);
    
    
    if( commitOld._rootId != commitNew._rootId ) {
      var seq = diffSeq3( commitOld._rootId, commitNew._rootId, _cId1, _cId2 );
      console.log(seq);
    }
    return seq;
    
    
    
  },
  "commit.diff": function( _idOld, _idNew ){
    var commitOld = Commits.findOne({ _id: _idOld });
    var commitNew = Commits.findOne({ _id: _idNew });
    
    var commitsQue = [];
    
    while( commitNew && commitNew.parent != commitOld._id ){
      commitsQue.push( commitNew );
      commitNew = Commits.findOne({ _id: commitNew.parent });
    }
    
    if ( commitNew && commitNew.parent == commitOld._id ) {
      commitsQue.push( commitNew );
      commitsQue.push( commitOld );
      
      console.log();
      
      var seqHistory = _.pluck( commitsQue.reverse(), 'rootId' );
      console.log( 'h', seqHistory);
      
      var diffSeq = seqDiff( seqHistory );
      var newRootSeqId = Atoms.insert({
        name: 'seq',
        data: diffSeq,
        meta: {
          diff: {
            type: 'change',
            parents: seqHistory
          },
          state: 'conflict'
        }
      });
      console.log( newRootSeqId );
      // console.log( commitsQue );
      
      
    } else {
      
      console.log( commitsQue );
      console.log('cannot compare unrelated commits');
      
    }
    
    
    // var diffedCommit = diffAtom( commit1.rootId, commit2.rootId );
    // 
    
  }
});


// search for the smalest matched index
findFirstMatched = function( as1, as2 ) {
  
  for(var m=0; m <= Math.max( as1.length, as2.length ); m++ ) {
    for( var i=0; i<= Math.min( as2.length, as1.length, m ); i++ ) {
      var j = m-i;
      
      if( i in as1 && j in as2 && as1[i]._seedId == as2[j]._seedId ) return { i:i, j:j };
      
    }
  }

  return { i: as1.length, j: as2.length };
}

diffSeq3 = function( _seqId1, _seqId2, _cId1, _cId2 ){
  
  console.log('begin');
  var seqAtom1 = Atoms.findOne({ _id: _seqId1 });
  var seqAtom2 = Atoms.findOne({ _id: _seqId2 });
  
  
  var ast1 = _.map(seqAtom1.data, function( _id ){
    return Atoms.findOne({ _id: _id });
  });

  var ast2 = _.map(seqAtom2.data, function( _id ){
    return Atoms.findOne({ _id: _id });
  });
  
  
  var ds = []; // final diffed sequence
  
  while ( ast1.length + ast2.length > 0 ) {
    
    var indexes = findFirstMatched( ast1, ast2 );
    console.log( 'intexes:', indexes.i, indexes.j, ast1.length, ast2.length );
    
    // take all elements < indexes.i from ast1 and push them to ds with changes
    if( indexes.i > 0 )
      ds = ds.concat( restackElements( ast1, indexes.i, _cId2, true ) );
    
    if( indexes.j > 0 )
      ds = ds.concat( restackElements( ast2, indexes.j, _cId1, false ) );
    
    
    var a1 = ast1.splice(0, 1)[0];
    var a2 = ast2.splice(0, 1)[0];
    
    console.log('a',a1,a2);
    if( a1 && a2 ) {
      if( a1._id == a2._id ) {
        console.log(a1);
        ds = ds.concat( [a1._id] );
      } else {
        a2.meta.diff = {
          type: 'change',
          atom: a1._id 
        }
        a2.meta.state = 'conflict';
        ds = ds.concat( [a2] );
      }
    }
    
  }
  
  
  // diff nested
  
  ds = _.map(ds, function( diffAtom, i ){
    
    if( typeof diffAtom == 'string' ) {
      return diffAtom;
    } else if( diffAtom.meta.diff.type == 'change' ) {
    
      var type = LLMD.Type( diffAtom.name );
      var nested = type && type.nested;
      
      if( nested ) {
        
        nested.forEach( function( key ){
          
          if( diffAtom.meta.diff.atom[key] != diffAtom[key] ) {
            
            diffAtom[key] = diffSeq3( diffAtom.meta.diff.atom[key], diffAtom[key], _cId1, _cId2 );
            
          }
          
        });
        
      }
      
    }
    
    return Atoms.insert( _.omit(diffAtom,'_id') );
    
  });
  
  // ds.reverse();
  
  var newSeqAtom = Atoms.insert({
    _id: 'diff_'+_cId1 +'_'+ _cId2 ,
    name: 'seq',
      data: ds,
      meta: {
        diff: {
          type: 'change'
        },
      state: 'conflict'
      }
  });

  return newSeqAtom;
}

restackElements = function( seq, i, _cId, add ){
  
  var atoms = seq.splice( 0, i );
  var key;
  
  atoms.forEach( function( a ){
    if ( key = getCommitKey( a, _cId ) ) {
      a.meta.diff = {
        type: 'move',
        key: key
      }
    } else {
      a.meta.diff = {
        type: (add?'add':'remove')
      }
    }
    a.meta.state = 'conflict';
  });
  
  return atoms;
  
}

getCommitKey = function( a, _cId ){
  return null;
}


diffSeq2 = function( as1, as2, _commitId1, _commitId2 ){
  
  var index = 0;

  var ds = []; // final diff sequence
  var a,b; // atom
   
  // atom can be removed, added, changed, moved
  while( a = as1.pop() ) {

   if( b = as2.pop() ) {
     
     // if a in as2 => a didn't change OR a change OR a moved
     //   if a is next
     //     if a changed
     //       push a diff changed
     //     else
     //       push a
     //   else a is at index > 1
     //     if b is added
     //       push b added
     //       push a to as1
     //     else b is moved
     //       push b moved from key
     //       
     //     => a is moved or
     //        b is moved in or
     //     => a is moved to index
     //     push a moved index
     // else a is in commit
     //   => a is moved to key
     //   push a moved key
     // else
     //   => a is removed
     //   push a removed 

   } else {
    // => as2 is empty
    // => a is moved or added
    // if a in commit 2 => a is moved 
    //   push a moved to key
    // else => a is added
    //   push a added
   }
      
     
   
 }

 // seq2 could also be empty -> terminate
 // seq2 is not empty -> added or moved elements
  
}



// [TODO] - try to refactor diff: remove old key and replace it with parents
//    parents[0] = old
var Diff = function( seq ){
  this._seq = seq;
  
  this.getValidIndex = function(i){
    for( var j=0; j<this._seq.length; j++ ){
      if( typeof this._seq[j] == 'string' || this._seq[j].meta.diff.type != 'remove' ) {
        if( i-- == 0 ) return j;
      }
    }
    return this._seq.length;
  }
  
  this.getId = function( i, type ){
    if( this._seq[i] === undefined ) return undefined;
    if( typeof this._seq[i] == 'string' ) return this._seq[i];
    else return this._seq[i]._id;
  }
  
  this.getNextId = function( i ){
    return this.getId( this.getValidIndex(i) );
  }
  
  this.remove = function( i ){
    var index = this.getValidIndex( i );
    if( typeof this._seq[index] == 'string' ) {
      var atom = Atoms.findOne({ _id: this._seq[index] });
      atom.meta.diff = {
        type: 'remove',
        parents: []
      };
      atom.meta.state = 'conflict';
      this._seq[index] = atom;
    } else {
      this._seq[index].meta.diff.type = 'remove';
    }
  }
  
  this.add = function( i, a ){
    var index = this.getValidIndex( i );
    var diffAtom = Atoms.findOne({ _id: a });
    diffAtom.meta.diff = {
      type: 'add',
      parents: [a]
    };
    diffAtom.meta.state = 'conflict';
    this._seq.splice(index, 0, diffAtom);
  }
  
  this.change = function( i, a ){
    var index = this.getValidIndex( i );
    if( typeof this._seq[index] == 'string' ) {
      var diffAtom = Atoms.findOne({ _id: a });
      diffAtom.meta.diff = {
        type: 'change',
        parents: [this._seq[index]]
      };
      diffAtom.meta.state = 'conflict';
    } else {
      var diffAtom = Atoms.findOne({ _id: a });
      var oldDiffAtom = this._seq[index];
      diffAtom.meta.diff = {
        type: oldDiffAtom.meta.diff.type,
        parents: oldDiffAtom.meta.diff.parents
      }
      diffAtom.meta.state = 'conflict';
      diffAtom.meta.diff.parents.push( oldDiffAtom._id );
    }
    this._seq[index] = diffAtom;
  }
  
  // this.setNew = function(i, a){
  //   if( typeof this._seq[i] == 'string' ) {
  //     this._seq[i] = a;
  //   } else {
  //     this._seq[i]['new'] = a;
  //   }
  // }
  
  this.nest = function( i, key, _id ){
    this._seq[i][key] = _id;
  }
  
  this.forEach = function( cb ){
    this._seq.forEach( function(a, i){
      if( typeof a == 'string' || a.meta.diff.type != 'remove' ) {
        cb(a, i);
      }
    });
  }
}

/**
 *  Generate a sequence diff based on atomic changes
 *  
 *  @param ids: Array of atom id's of the type sequence
 *              ids[0] < ids[n]
 * 
 */
seqDiff = function( ids ) { 
  
  // seq
  as = _.map( ids, function( a ){ return Atoms.findOne( a ); });
  
  var diff = new Diff(as[0].data);
  
  for(  var i=1; i < as.length; i++ ) {
    
    var seq = as[i].data; // new Sequence
    
    for( var j=0; j < seq.length; j++ ) {
      
      var na = seq[j]; // new Atom ID
      var oa = diff.getNextId( j ); // old Atom ID
      
      if( na == oa ) { // old atom is new atom
        // do nothing
      } else if( na === undefined || diff.getNextId( j+1 ) == na ) { // last element or removed and next is the old one
        console.log(j, oa, na, diff.getValidIndex(j+1), diff._seq);
        // removed
        diff.remove(j);
        break;
      } else if( oa === undefined ||  j+1 in seq && seq[j+1] == oa ) {
        diff.add(j, na);
        break;
      } else if( ( !(j+1 in seq ) && !( diff.getNextId(j+1) ) ) || ( ( (j+1 in seq ) && ( diff.getNextId(j+1) ) ) && seq[j+1] == diff.getNextId( j+1 ) ) ) // both last or next elements are the same
      {
        diff.change( j, na );
        break;
        
      } else {
        throw new Error('this should never get fired');
      }
      
    }
    
  }
  
  // go recursivly and diff nested
  diff.forEach( function( diffAtom, i ){
    
    if( typeof diffAtom != 'string' && diffAtom.meta.diff.type == 'change' ) {
    
      var type = LLMD.Type( diffAtom.name );
      var nested = type && type.nested;
      
      if( nested ) {
        // build history sequence
        // var history = [diffAtom.old].concat( diffAtom.parents );
        // history.push( diffAtom.new );
        // 
        var history = diffAtom.meta.diff.parents;
        history.push(diffAtom._id);
        history.reverse();
        console.log('history',history);
        
        nested.forEach( function( key ){
          // build history sequence of each nested sequences
          
          var seqHistory = [];
          
          history.forEach( function( nodeId ){
            var atom = Atoms.findOne({ _id: nodeId });
            console.log( 'ak ', key ,atom[key] );
            if( seqHistory[ seqHistory.length - 1 ] != atom[key] ) {
              seqHistory.push( atom[key] );
            }
          });
          
          console.log('sq ',seqHistory);
          
          
          if( seqHistory.length > 1 ) {
            
            var newSeqData = seqDiff( seqHistory.reverse() );
            var newSeqAtom = Atoms.insert({
              name: 'seq',
              data: newSeqData,
              meta: {
                diff: {
                  type: 'change',
                  parents: seqHistory
                },
                state: 'conflict'
              }
            });
            
            console.log(i,key,newSeqAtom);
            diff.nest(i,key,newSeqAtom)
          }
          
          
        });
        
        // //check if one nested has changed
        // var newAtomId = Atoms.insert( _.omit( newAtom, '_id' ) );
        // diff.setNew( i, newAtomId );
        
      }
    }
    
  });
  
  
  // build diff sequence
  var newSeq = _.map( diff._seq, function( o ){
    if( typeof o == 'string' ) return o;
    return Atoms.insert(_.omit(o,'_id'));
  });
  
  
  return newSeq;
  
};



// test data:
// 

// diff = function( as, bs ){
//   var r = [];
//   var length = a.length;
//   
//   
//   for( var i=0; i<length; i++ ) {
//     var a = as.pop();
//     
//     if( b.length > 0 ) { 
//       var b = bs.pop();
//       
  //     if( a == b ) {  // a didn't change
  //       r.push( a );
  //     } else if( bs.indexOf( a ) >= 0 ) { 
  //       r.push({
  //         name: 'diff',
  //         type: 'add',
  //         orig: '',
  //         remote: b
  //       });
  //       for( var j=0; j<bs.indexOf( a ); j++ ) {
  //         b = bs.pop();
  //         r.push({
  //           name: 'diff',
  //           type: 'add',
  //           orig: '',
  //           remote: b
  //         });
  //       }
  //     } else {
  //       // possibly:
  //       // * its the same atom but changed 
  //       // * this atom was removed
  //     }
  //     
  //       
//     } else { // a was removed
//       r.push({
//         name: 'diff',
//         type: 'remove',
//         orig: a,
//         remote: ''
//       });
//     }
//     
//   }
// }
