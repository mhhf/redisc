Router.map(function(){
  
  this.route('blogPosts',{
    path:'blogs',
    waitOn: function(){
      return Meteor.subscribe('Blog.Posts');
    },
    data: function(){
      return {
        posts: Atoms.find({name: 'blog'})
      }
    }
  });
  
  this.route('blogPost',{
    path:'blog/:_id',
    waitOn: function(){
      return Meteor.subscribe('atom.deep',this.params._id);
    },
    data: function(){
      return {
        atom: new AtomModel(this.params._id)
      }
    }
  });

});
