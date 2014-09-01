Template.PostWrapper.created =  function(){
  this.data._tmp = {
    watch: Meteor.user().profile.watch
  }
}

Template.PostWrapper.helpers({
  isHighlighted: function(){
    var atom = this.get();
    return (this._tmp.watch && this._tmp.watch[atom.root] < atom.updatedOn)?'highlight':'';
    
  },
  owner: function(){
    var gs = Meteor.user().profile.groups;
    var o = this.get().owner;
    
    return gs.indexOf(o) > -1;
  }
});
