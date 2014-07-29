Template.Stats.hasTags = function(){
  return this.tags.length > 0;
}

Template.Stats.helpers({
  
  comments: function(){
    console.log(this.comments);
    return this.comments;
  },
  userName: function(){
    return this.user && this.user.name;
  }
  
});

Template.Stats.lastChange = function(){
  return moment(this.updatedOn).fromNow() || moment(this.createdOn).fromNow();
}

Template.Score.events({
  "click [name=up]": function(e,t){
    e.preventDefault();
    vote(this.getId(), 1);
  },
  "click [name=down]": function(e,t){
    vote(this.getId(), -1);
  }
});

var vote = function(_id, value){
  Meteor.call('post.vote',{
    _id: _id,
    value: value
  });
}

Template.Score.helpers({
  voted: function(c){
    if(c === 'up') {
      return this.get().upvotes.indexOf(Meteor.userId())>-1?'active':'';
    } else if (c === 'down') {
      return this.get().downvotes.indexOf(Meteor.userId())>-1?'active':'';
    }
  },
  getScore: function(){
    // console.log( 'sc', this.get().data, this.get().score);
    return this.get().score;
  }
});

Template.Comments.rendered = function(){
}
