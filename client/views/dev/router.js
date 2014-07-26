Router.map( function(){
  this.route('dev', {
    waitOn: function(){
      return Meteor.subscribe('Redisc.Posts',['dev']);
    },
    data: function(){
      return {
        posts: Atoms.find({ name: 'redisc', root: '' })
      };
    }
  
    
  });
  
  this.route('devNew', {
    path: '/dev/new',
    waitOn: function(){
      return Meteor.subscribe('tags');
    },
    data: {
      ctx: 'dev',
      tags: Tags.find(),
      onSuccess: function(){
        Router.go('dev');
      }
    }
  });

  this.route('devPost', {
    path: '/dev/:_id',
    waitOn: function(){
      return Meteor.subscribe('Redisc.Post',this.params._id);
    },
    data: function(){
      return new RediscModel({ rootId: this.params._id });
    }
  });
  
});


