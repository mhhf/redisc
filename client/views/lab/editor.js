Template.editor.events = {
  "click .edit-atom-btn": function( e, t ){
    e.preventDefault();
    
    var atom = new AtomModel(e.currentTarget.dataset.target);
    if(!atom) console.log('no atom found');
    
    AtomModel.set( 'EDIT', atom );
  },
  "click .save-atom-btn": function( e, t ){
    e.preventDefault();
    
    AtomModel.data.update( this.buildAtom() );
    AtomModel.set('INIT');
  },
  "click .cancel-atom-btn": function(){
    console.log('cancel');
    AtomModel.set('INIT');
  }
}
