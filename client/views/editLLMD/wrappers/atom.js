


Template.atomWrapper.rendered = function(){
  console.log(this.data); 
}



Template.atomWrapper.helpers({
  editable: function(){
    return editorModel.editable && this.atom.meta.state != 'conflict';
  },
  editMode: function(){
    var edit = editorModel.get('edit') || editorModel.get('add');
    return edit === this ;
  },
  editModeClass: function(){
    
    if( editorModel.get('edit') === this) {
      return 'edit';
    } else if( !this.isLocked() ){
      return 'changed';
    } else {
      return '';
    }
  },
  getActivateClass: function(){
    return ( this.get().meta.active )?'':'inactive';
  },
  isActive: function(){
    return ( this.get().meta.active );
  },
  dynamicTemplate: function(){
    var edit = editorModel.get("edit") || editorModel.get('add');
    var editMode =  edit === this;
    console.log('aahhaha', editMode);
    var mode = ( editMode )?'edit':'ast';
    var template = Template['llmd_'+this.get().name+'_'+mode];
    if(!template) throw new Error('no teplate for '+this.get().name+" found!");
    return template || null;
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
    return this.get().meta.state == "pending";
  }
});

Template.diffWrapper.helpers({
  getDiffedAtom: function(){
    var otherAtom = Atoms.findOne({ _id: this.get().meta.diff.atom });
    otherAtom.meta.state = 'conflict';
    return this.wrapAtom( otherAtom, this.parents );
  }
});

Template.atomWrapper.events = {
  "click .edit-btn": function(e,t){
    e.preventDefault();
    
    // perserve height
    var ele = t.find('.atomContainer');
    $(ele).css('min-height',ele.clientHeight + "px");
    console.log(this);
    
    editorModel.set( 'edit', this );
  },
  "click .remove-btn": function(e,t){
    var self = this;
    $(t.find('.atomContainer')).fadeOut(400, function(){
      self.remove( self.parents.concat( [ self.atom._id ] ));
      // $(t.find('.atomContainer.')).css('display','block');
    });
  },
  "click .save-btn": function(e,t){
    e.preventDefault();
    var atom = this.buildAtom();
    editorModel.save( _.extend( atom, { meta: { state: 'pending' } } ) );
    
  },
  "click .dismiss-btn": function(e,t){
    e.preventDefault();
    
    this.dismiss();
  },
  "click .activate-toggle-btn": function(e,t){
    e.preventDefault();
    var atom = this.atom;
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
