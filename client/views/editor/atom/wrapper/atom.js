

Template.devAtomWrapper.helpers({
  getName: function(){
    return this.get().name;
  },
  editable: function(){
    return this.get().meta.state != 'conflict';
  },
  editMode: function(){
    var edit = AtomModel.get('edit') || AtomModel.get('add');
    return edit === this;
  },
  editModeClass: function(){
    // if( editorModel.get('edit') === this) {
    //   return 'edit';
    // } else if( !this.isLocked() ){
    //   return 'changed';
    // } else {
      return '';
    // }
  },
  getActivateClass: function(){
    return '';
    // return ( this.atom.get().meta.active )?'':'inactive';
  },
  isActive: function(){
    return true;
    // return ( this.atom.get().meta.active );
  },
  getSmallSpinner: function(){
    return {
      lines: 11, // The number of lines to draw
      length: 4, // The length of each line
      width: 2, // The line thickness
      radius: 4, // The radius of the inner circle
      corners: 1, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      direction: 1, // 1: clockwise, -1: counterclockwise
      color: '#000', // #rgb or #rrggbb or array of colors
      speed: 1, // Rounds per second
      trail: 42, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: '0', // Top position relative to parent
      left: '0' // Left position relative to parent 
    };
  },
  isPending: function(){
    return this.atom.get().meta.state == "pending";
  }
});

Template.atomWrapper.helpers({
  // Select wrapper type for each atom
  //
  // default wrapper is 'devAtomWrapper'
  //
  wrapperTemplate: function(){
    var wrapperName = 'devAtomWrapper';
    
    switch( this.get().name ){
      case 'seq':
        wrapperName = 'seqWrapper';
        break;
      case 'redisc': 
        wrapperName = 'PostWrapper';
        break;
      case 'name': 
        wrapperName = 'nameWrapper';
        break;
    }
    
    return Template[ wrapperName ];
  },
  dynamicTemplate: function(){
    var edit = AtomModel.get("edit") || AtomModel.get('add');
    var editMode =  edit === this;
    var mode = ( editMode )?'edit':'ast';
    var template = Template['llmd_'+this.get().name+'_'+mode];
    if(!template) throw new Error('no teplate for '+this.get().name+" found!");
    return template || null;
  },
});


Template.diffWrapper.helpers({
  getDiffedAtom: function(){
    var otherAtom = Atoms.findOne({ _id: this.get().meta.diff.atom });
    otherAtom.meta.state = 'conflict';
    return this.wrapAtom( otherAtom, this.parents );
  }
});

Template.devAtomWrapper.events = {
  "click .edit-btn": function(e,t){
    e.preventDefault();
    
    // perserve height
    var ele = t.find('.atomContainer');
    $(ele).css('min-height',ele.clientHeight + "px");
    console.log(this);
    
    AtomModel.set( 'edit', this);
  },
  "click .remove-btn": function(e,t){
    var self = this;
    $(t.find('.atomContainer')).fadeOut(400, function(){
      self.remove( self.parents.concat( [ self._id ] ));
      // $(t.find('.atomContainer.')).css('display','block');
    });
  },
  "click .save-btn": function(e,t){
    e.preventDefault();
    
    var atom = _.extend( this.buildAtom(), { meta: { state: 'pending' } } );
    this.update(atom);
    AtomModel.set( 'INIT' );
    
  },
  "click .dismiss-btn": function(e,t){
    e.preventDefault();
    
    this.dismiss();
  },
  "click .activate-toggle-btn": function(e,t){
    e.preventDefault();
    var atom = this;
    atom.meta.active = !atom.meta.active;
    this.save( atom, this.parents.concat([ this.atom._id ]) );
  }
  
}



Template.conflictActions.helpers({
  diff: function(){
    // [TODO] - turn on after atom_<name>_diff is implemented
    return this.atom.meta.diff.type == 'change' && false;
  },
});

Template.conflictActions.events = {
  "click .left-btn": function(){
    this.diffLeft( this );
  },
  "click .diff-btn": function(){
    console.log('diff');
  },
  "click .right-btn": function(){
    this.diffRight( this );
  }
}
