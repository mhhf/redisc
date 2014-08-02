Router.onBeforeAction('loading');

Router.map( function(){
  
  this.route('RediscAll', {
    path:'/',
    template: 'RediscPosts', 
    onBeforeAction: function (pause) {
      AccountsEntry.signInRequired( this, pause );
    },
    waitOn: function(){
      return Meteor.subscribe( 'Redisc.Posts', [] );
    },
    data: function(){
      Session.set( 'tags', null );
      return {
        posts: Atoms.find({ name: 'redisc', root: '' }, {sort: { score: -1 }})
      };
    }
  });
  
  this.route('RediscTags', {
    path:'/tags/:tags',
    waitOn: function(){
      var tagsA = this.params.tags.split(',');
      return Meteor.subscribe( 'Redisc.Posts', tagsA );
    },
    onBeforeAction: function ( pause ) {
      AccountsEntry.signInRequired( this, pause );
    },
    data: function(){
      Session.set( 'tags', this.params.tags );
      
      return {
        posts: Atoms.find({ name: 'redisc', root: '' }, {sort: { score: -1 }})
      };
    }
  });
  
  this.route('RediscPostNew', {
    path: '/post/new/:tags?',
    template: 'RediscPostNew',
    waitOn: function(){
      return Meteor.subscribe('tags');
    },
    onBeforeAction: function ( pause ) {
      AccountsEntry.signInRequired( this, pause );
    },
    data: function(){
      var tags = this.params.tags;
      return {
        ctx: tags && tags.split(','),
        tags: Tags.find(),
        onSuccess: function(){
          Router.go('dev');
        }
      };
    } 
  });

  this.route('RediscPostView', {
    path: '/dev/:_id',
    waitOn: function(){
      return Meteor.subscribe('Redisc.Post',this.params._id);
    },
    onBeforeAction: function () {
      AccountsEntry.signInRequired(this);
    },
    data: function(){
      return new RediscModel({ rootId: this.params._id });
    }
  });
  
});


