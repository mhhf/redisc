App = {
  offline: true
}

Meteor.startup( function(){
  
  Meteor.subscribe('popularTags');
  
  ModuleLoader.define('mathjax', {
    source: "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML",
    verify: function () {
      return window.MathJax;
    },
    loaded: function (MathJax) {
      console.log('loaded MathJax');
      MathJax.Hub.Config({
        showProcessingMessages: false,
        tex2jax: { inlineMath: [['$','$'],['\\(','\\)']] }
      });
    },
  }); 
  
  ModuleLoader.load('mathjax');
  
  AccountsEntry.config({
    homeRoute: '/',
    dashboardRoute: '/',
    profileRoute: '/profile',
    passwordSignupFields: 'EMAIL_ONLY',
    showSignupCode: true,
    showOtherLoginServices: true
  }); 
  
  
  
});
