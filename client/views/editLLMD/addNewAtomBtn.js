var parents;
Template.addNewAtomBtn.events({
  "click .add-btn": function(e,t){
    e.preventDefault();
    
    // parents = this.parents.concat( this.atom._id );
    
    AtomModel.set( 'CHOOSING', this );
  },
  "submit": function(e,t){
    e.preventDefault();
    
    var package = t.find('#newAtom').value;
    
    
    console.log( package );
    
  }
});

Template.addNewAtomBtn.helpers({
  editable: function(){
    return true;
  },
  isAdding: function(a,b){
    var adding = AtomModel.get('ADD');
    // console.log(this,adding, this.atom);
    // return adding && adding.key == this.getId();
    return adding && adding.parent == this;
  },
  isChoosing: function(){
    // console.log('hahah',this);
    return AtomModel.get('CHOOSING') == this;
  },
  tmpAtom: function(){
    return this.editorModel.get('add').atom;
  } 
});

Template.selectLLMDTypes.helpers({
  atomTypes: function(){
    return _.keys(LLMD.packageTypes);
  }
});


Template.selectLLMDTypes.rendered = function(){
  var self = this;
  
  $('select').selectize({
    onChange: function( name ){
      self.data.atom.addAfter(self.data.key, new LLMD.Atom(name));
      AtomModel.set('INIT');
    }
  })[0].selectize.focus();
}



// addAtom = function( name ){
// 
//   this.add( new LLMD.Atom( name ), parents );
// 
// }
