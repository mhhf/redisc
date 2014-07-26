

Template.editLLMD.rendered = function(){
}

Template.editLLMD.helpers({
  getRoot: function(){
    
    return this.getRoot();
    
    // var atom = this.editorModel.wrapAtom( this.editorModel.ast, [] );
    // return atom;
  },
});


Template.editLLMD.events({
//   "click .add-btn": function(e,t){
//     e.preventDefault();
//     
//   },
//   "click .md-btn": function(e,t){
//     e.preventDefault();
//     addAtom.apply( this, ['md'] );
//     
//   },
//   "click .tts-btn": function(e,t){
//     e.preventDefault();
//     
//     addAtom.apply( this, ['tts'] );
//     
//   },
//   "click .ms-btn": function(e,t){
//     e.preventDefault();
//     
//     addAtom.apply( this, ['multipleChoice'] );
//     
//   },
//   "click .comment-btn": function(e,t){
//     e.preventDefault();
//     
//     addAtom.apply( this, ['redisc'] );
//     
//   },
//   "click .if-btn": function(e,t){
//     e.preventDefault();
//     
//     addAtom.apply( this, ['if'] );
//   },
  "click .commit-btn": function(e,t){
    e.preventDefault();
    
    var self = this;
    bootbox.prompt("What did you changed?", function(result) {                
      self.editorModel.commitModel.commit({
        msg: result
      });
    }); 
  },
  "click .fork-btn": function(){
    console.log('fork');
  },
  "click .merge-btn": function(){
    state.set('merge.branch');
    // console.log('merge');
  }
});


Template.diffWrapper.helpers({
  type: function(){
    return this.atom.meta.diff.type;
  }
});

Template.branchSelector.events = {
  "click .create-branch-btn": function(){
    
    if( !this.root.meta.commit ) {
      
      bootbox.alert("Pleas Commit first!", function() {
        
      });
      return null;
    }
    
    state.set( 'branch.new' )
    // addNewBranch.set( true );
  },
  "submit": function( e, t ){ // NEW BRANCH
    e.preventDefault();
    
    
    
    var name = t.find('[name=name]').value;
    
    var _branchId = LQTags.insert({ 
      name: name,
      _commitId: this.head._id,
      type: 'branch',
      _unitId: this.head._unitId
    });
    
    Router.go('branch.edit',{
      user: this.user,
      unit: this.unit.name,
      branch: name
    });
    
    // addNewBranch.set( false );
    state.set( 'init' );
  },
  "click .btn-dismiss": function(){
    // addNewBranch.set( false );
    state.set( 'init' );
  },
}

Template.branchSelector.helpers({
  isAdding: function(){
    return state.get() === 'branch.new';
    // return addNewBranch.get();
  },
  onBranch: function(){
    return this.branch;
  },
});

Template.selectBranch.helpers({
  isSelected: function( data ){
    return (data && data.branch && data.branch._id == this._id)? 'selected':'';
  }
});



var state = {
  dep:	new Deps.Dependency,
  val: 'init',
  data: null,
  get: function(){
    this.dep.depend();
    return this.val;
  },
  set: function( val ){
    this.dep.changed();
    this.val = val;
  },
}
    
Template.selectBranch.rendered = function(){
  var self = this.data;
  $('.branchSelect').selectize({
    onChange: function( name ){
      
      if( state.get().match('^branch') ) {
        Router.go('branch.edit', {
          user: self.user,
          unit: self.unit.name,
          branch: name
        });
        state.set( 'init' );
      } else if( state.get().match('^merge') ) {
        state.data = name;
      }
      
      
    }
  });
}

Template.editNavBar.helpers({
  getLevel: function(){
    return  ( state.get() != 'init' ) ? 'lvl2':'';
  },
  getContext: function(){
    switch( state.get() ) {
      case 'branch.select' :
        return 'Change Branch';
      case 'branch.new':
        return 'Create Branch';
      case 'merge.branch':
        return 'Merge Branch';
    }
    return '';
  },
  state: function( name ){
    console.log(state.get());
    return state.get().match('^'+name);
  },
  getMergeBranches: function(){
    var branches = this.branches.fetch();
    var self = this;
    branches = _.filter(branches, function(b){
      return b.name != self.branch.name;
    });
    // return branches;
    return {
      branches: branches
    }
  },
  isChanged: function(){
    // return ( !this.root.meta.commit )?'changed':'';
  },
  branchName: function(){
    return this.getBranch().get().name;
  }
});

Template.editNavBar.events = {
  "click .branch-change": function(){
    state.set( 'branch.select' );
  },
  "click .apply-merge-btn": function(){
    
    var self = this;
    // [TODO] - state.data._id instead of name
    var c1 = LQTags.findOne({ name: state.data });
    var _cId1 = c1 && c1._commitId;
    
    
    if( _cId1 && this.branch._id ) { // if both ids are valide
      
      console.log( _cId1, this.branch._commitId );
      
      Meteor.call('commit.diff2', _cId1, this.branch._commitId, function( e, _sId ){
        
        self.editorModel.commitModel.changeRoot( _sId );
        
      });
      
    }
    
    console.log('merge', state.data, 'into', this.branch);
    
    state.set('init');
  },
  "click .init-btn": function(e,t){
    e.preventDefault();
    
    state.set('init');
  }
}
