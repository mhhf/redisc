Router.map( function(){
  
  // [TODO] - redirect to :user/:unit/master
  this.route('unit.edit', {
    path: '/lq/:user/:unit',
    template: 'editLLMD',
    waitOn: function(){
      return Meteor.subscribe( 'unit', this.params.user + this.params.unit );
    },
    data: function(){
      
      mediaHandler = new SyncQue();
      
      var unit = Units.findOne({ _id: this.params.user+this.params.unit });
      // var branch = LQTags.findOne({ _id: unit.branch._id });
      // var commit = Commits.findOne({ _id: branch._commitId });
      // var rootAtom = Atoms.findOne({ _id: commit._rootId });
      // var tree = new TreeModel( commit._rootId );
      
      editorModel = new EditorModel({
        editable: true,
        branch: new TagModel( unit.branch._id )
      });
      
      return editorModel
      
      // return {
      //   head: commit,
      //   user: this.params.user,
      //   unit: unit,
      //   mediaHandler: mediaHandler,
      //   root: rootAtom,
      //   editorModel: editorModel,
      //   branch: branch,
      //   branches: LQTags.find({ _unitId: unit._id })
      // };
    }
    
  });
  
  this.route('branch.edit', {
    path: '/lq/:user/:unit/:branch',
    template: 'editLLMD',
    waitOn: function(){
      return Meteor.subscribe( 'unit', this.params.user + this.params.unit );
    },
    data: function(){
      
      mediaHandler = new SyncQue();
      
      var unit = Units.findOne({ _id: this.params.user+this.params.unit });
      var branch = LQTags.findOne({ name: this.params.branch, _unitId: unit._id });
      console.log(branch);
      var commit = Commits.findOne({ _id: branch._commitId });
      console.log(commit);
      var rootAtom = Atoms.findOne({ _id: commit._rootId });
      var branches = LQTags.find({ _unitId: unit._id, _id: { $not: branch._id } }).fetch();
      var tree = new TreeModel( commit._rootId );
      
      
      
      var editorModel = new EditorModel({
        editable: true,
        commitModel: new CommitModel({ 
          _branchId: branch._id 
        }),
        tree: tree
      });
      
      return {
        head: commit,
        user: this.params.user,
        unit: unit,
        mediaHandler: mediaHandler,
        root: rootAtom,
        editorModel: editorModel,
        branch: branch,
        branches: branches
      };
    }
    
  });
  
  this.route('commit.view', {
    path: 'commit/:_commitId',
    template: 'editLLMD',
    waitOn: function(){
      // [TODO] - subscribe to unit
      return Meteor.subscribe( 'commit', this.params._commitId );
    },
    data: function(){
      
      var editorModel = new EditorModel({
        editable: false,
        commitModel: new CommitModel( {
          _commitId: this.params._commitId
        } )
      });
      
      mediaHandler = new SyncQue();
      
      var commit = Commits.findOne({ _id: this.params._commitId });
      var rootAtom = Atoms.findOne({ _id: commit._rootId });
      var unit = Units.findOne({ _id: commit._unitId });
      
      return {
        head: commit,
        unit: unit,
        editorModel: editorModel,
        root: rootAtom,
        mediaHandler: mediaHandler
      };
    }
    
  });
  
  
  this.route('commit.history', {
    template: 'commitHistory',
    path: 'commit/:_commitId/history',
    waitOn: function(){
      return Meteor.subscribe( 'commitHistory', this.params._commitId );
    },
    data: function(){
      return {
        head: Commits.findOne({ _id: this.params._commitId })
      };
    }
  });
  
  
  this.route('atom.view', {
    template: 'editLLMD',
    
    path: 'atom/:_atomId',
    waitOn: function(){
      return Meteor.subscribe('atom',this.params._atomId);
    },
    data: function(){
      
      
      var rootAtom = Atoms.findOne({ _id: this.params._atomId });
      var editorModel = new EditorModel({
        editable: false,
      });
      
      mediaHandler = new SyncQue();
      console.log(editorModel);
      
      return {
        user: this.params.user,
        mediaHandler: mediaHandler,
        root: rootAtom,
        editorModel: editorModel,
      };
    }
    
  });
  
  
  this.route('diff.view', {
    template: 'editLLMD',
    
    path: 'diff/:_commitId1/:_commitId2',
    waitOn: function(){
      return Meteor.subscribe('diffedAtom', this.params._commitId1, this.params._commitId2);
    },
    data: function(){
      
      var rootAtom = Atoms.findOne({ _id: 'diff_'+this.params._commitId1+'_'+this.params._commitId2 });
      var editorModel = new EditorModel({
        editable: false,
      });
      
      console.log(rootAtom);
      
      mediaHandler = new SyncQue();
      
      return {
        user: this.params.user,
        mediaHandler: mediaHandler,
        root: rootAtom,
        editorModel: editorModel,
      };
    }
    
  });
  
  
});
