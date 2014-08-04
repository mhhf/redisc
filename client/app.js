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
    profileRoute: '/dashboard',
    passwordSignupFields: 'EMAIL_ONLY',
    showOtherLoginServices: true,
    extraSignUpFields: [{          
        field: "name",            
        label: "Username",
        placeholder: "Username...",
        type: "text",
        required: true
       }]
  }); 
  
  
  Meteor.subscribe('files');
  
  
});
