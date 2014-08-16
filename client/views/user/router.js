Router.map( function(){
  
  this.route( 'account' );
  this.route( 'profile', {
    layoutTemplate: 'sideLayout',
    yieldTemplates:{
      navbar: { to: 'navbar' },
      profileNavigation: { to: 'aside' }
    }
  });
  
  this.route( 'userFollows', {
    path: '/profile/follow',
    layoutTemplate: 'sideLayout',
    yieldTemplates:{
      navbar: { to: 'navbar' },
      profileNavigation: { to: 'aside' }
    }
  });
  
  this.route( 'userGroups', {
    path: '/profile/groups',
    layoutTemplate: 'sideLayout',
    yieldTemplates:{
      navbar: { to: 'navbar' },
      profileNavigation: { to: 'aside' }
    },
    waitOn: function(){
      var g = Meteor.user() &&  Meteor.user().profile.groups || [] ;
      return Meteor.subscribe('user.groups', g );
    }
  });
  
});
