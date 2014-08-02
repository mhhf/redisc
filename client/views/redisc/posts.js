Template.RediscPosts.helpers({
  atomModel: function(){
    return new AtomModel( this._id );
  },
  getTags: function(){
    return Session.get('tags');
  },
  getPageUrl: function( ctx ){
    if(ctx.tags && ctx.tags.length > 0) {
      return '/tags/'+ctx.tags.join(',')+'/'+this;
    } else {
      return '/all/'+this;
    }
  },
  getNextUrl: function(){
    if(this.tags && this.tags.length > 0) {
      return '/tags/'+this.tags.join(',')+'/'+(this.page+1);
    } else {
      return '/all/'+(this.page+1);
    }
  },
  getPrevUrl: function(){
    if(this.tags && this.tags.length > 0) {
      return '/tags/'+this.tags.join(',')+'/'+(this.page-1);
    } else {
      return '/all/'+(this.page-1);
    }
  },
  hasPrevious: function(){
    return this.page>0;
  },
  hasNext: function(){
    return this.pages.length-1 > this.page;
  },
  isActive: function( ctx ){
    return ctx.page == this?'active':'';
  },
  hasPages: function(){
    return this.pages.length > 1
  }
});
