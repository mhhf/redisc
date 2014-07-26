var parents;
Template.addNewAtomBtn.events({
  "click .add-btn": function(e,t){
    e.preventDefault();
    
    // parents = this.parents.concat( this.atom._id );
    
    this.editorModel.set( 'choose', this.atom );
  },
  "submit": function(e,t){
    e.preventDefault();
    
    var package = t.find('#newAtom').value;
    
    
    console.log( package );
    
  }
});

Template.addNewAtomBtn.helpers({
  editable: function(){
    return this.editorModel.editable;
  },
  isAdding: function(a,b){
    var adding = this.editorModel.get('add');
    // console.log(this,adding, this.atom);
    // return adding && adding.key == this.getId();
    return adding && adding.parent == this.atom;
  },
  isChoosing: function(){
    // console.log('hahah',this);
    return this.editorModel.get('choose') == this.atom;
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
      self.data.editorModel.add( name, self.data.key, self.data.atom );
    }
  })[0].selectize.focus();
}



// addAtom = function( name ){
// 
//   this.add( new LLMD.Atom( name ), parents );
// 
// }
