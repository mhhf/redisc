Router.configure({
  layoutTemplate: 'defaultLayout',

  notFoundTemplate: 'noFound',

  loadingTemplate: 'loading',

  yieldTemplates: { 
    'footer': { to: 'footer' },
    'navbar': { to: 'navbar' }
  }

});

Router.onBeforeAction('loading');
Router.onBeforeAction( function(a,c){
  
  if( !Meteor.userId() ) {
    if( ['entrySignIn','entrySignUp'].indexOf(this.route.name) == -1 ) {
      Router.go('/sign-in');
    } else {
      this.next();
      return null;
    }
  }
  
  var except = [ 'register1', 'register2' ];
  
  var user = Meteor.user();
  if( user && user.profile.state != 'rdy' && except.indexOf( this.route.name ) == -1 ) {
    Router.go( 'register' + ( user.profile.state || 1 ) );
  } else {
    this.next();
  }
  
});
