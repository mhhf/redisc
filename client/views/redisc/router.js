Router.onBeforeAction('loading');

Router.map( function(){
  
  this.route('Home', {
    path:'/',
    action: function(){
      this.redirect('RediscAll');
    }
  });
  
  this.route('RediscAll', {
    path:'/all/:page?',
    template: 'RediscPosts', 
    onBeforeAction: function (pause) {
      AccountsEntry.signInRequired( this, pause );
    },
    waitOn: function(){
      var page = this.params.page || 0;
      return [
        Meteor.subscribe( 'Redisc.Posts', [], page ),
        // new SyncLoader( 'Redisc.Posts.count', [] )
      ];
    },
    data: function(){
      var postsCount = syncValue['Redisc.Posts.count'];
      var pages = [];
      var page = -(-this.params.page) || 0;
      
      for(var i=0; i<Math.floor(postsCount/20); i++ ) {
        pages.push(i);
      }
      if(postsCount/20 - Math.floor(postsCount/20) > 0) pages.push(i)
      
      Session.set( 'tags', null );
      return {
        posts: Atoms.find({ name: 'redisc', root: '' }, {sort: { score: -1, updatedOn: -1 }}),
        pages: pages,
        page: page,
        tags:[]
      };
    }
  });
  
  this.route('RediscTags', {
    path:'/tags/:tags/:page?',
    waitOn: function(){
      var tagsA = this.params.tags.split(',');
      var page = this.params.page || 0;
      return [
        Meteor.subscribe( 'Redisc.Posts', tagsA, page ),
        // new SyncLoader( 'Redisc.Posts.count', tagsA )
      ];
    },
    onBeforeAction: function ( pause ) {
      AccountsEntry.signInRequired( this, pause );
    },
    data: function(){
      
      var postsCount = syncValue['Redisc.Posts.count'];
      var pages = [];
      var page = -(-this.params.page) || 0;
      
      for(var i=0; i<Math.floor(postsCount/20); i++ ) {
        pages.push(i);
      }
      if(postsCount/20 - Math.floor(postsCount/20) > 0) pages.push(i)
      
      
      Session.set( 'tags', this.params.tags );
      var tagsA = this.params.tags.split(',');
      return {
        posts: Atoms.find({ name: 'redisc', root: '', tags: { $in: tagsA  }  }, {sort: { score: -1, updatedOn: -1 }}),
        pages: pages,
        page: page,
        tags: tagsA
      };
    }
  });
  
  this.route('RediscPostNew', {
    path: '/post/new/:tags?',
    template: 'RediscPostNew',
    waitOn: function(){
      return Meteor.subscribe('GlobalTags');
    },
    onBeforeAction: function ( pause ) {
      AccountsEntry.signInRequired( this, pause );
    },
    data: function(){
      var tags = this.params.tags;
      return {
        ctx: tags && tags.split(','),
        tags: GlobalTags.find(),
        onSuccess: function(){
          Router.go('RediscPosts');
        }
      };
    } 
  });

  this.route('RediscPostView', {
    path: '/post/:_id',
    waitOn: function(){
      return Meteor.subscribe('Redisc.Post',this.params._id);
    },
    onBeforeAction: function () {
      AccountsEntry.signInRequired(this);
    },
    data: function(){
      return { atom: new AtomModel( this.params._id ) };
    }
  });
  
});



var syncValue = {};
SyncLoader = function( name, data ){

  
  var readyFlag = false ;
  var readyFlagDep = new Deps.Dependency;
  var value = null;

  var ready = function(){
    readyFlagDep.depend();
    
    return readyFlag;
  }
  
  var setReady = function( val ){
    readyFlag = val;
    readyFlagDep.changed();
  }
  
  Meteor.call( name, data, function(err, data){
    syncValue[ name ] = data;
    setReady(true);
  });
  
  retObj = {
    ready: ready
  };
  return retObj;
};

