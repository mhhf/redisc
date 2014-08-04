Template.register1.helpers({
  
  getEmail: function(){
    return Meteor.user() && Meteor.user().emails && Meteor.user().emails[0].address;
  },

  getUsername: function(){
    return Meteor.user() && Meteor.user().profile && Meteor.user().profile.name;
  }
  
});


Template.register1.events ={
  
  "submit": function(e,t){
    e.preventDefault();
    
    var valide = true;
    var email = t.find('input#email').value;
    var name = t.find('input#username').value;
    
    if( !email || email.indexOf('@') == -1 ) {
      $('input#email').addClass('required');
      valide = false;
    } 
    
    if( !name ) {
      $('input#username').addClass('required');
      
      valide = false;
    } 
    
    if(!valide) return null;
    
    Meteor.call('user.register1',{
      name: name,
      email: email
    }, function( err, succ ){
      // [TODO] - check if username && email is taken
      
      Router.go('dashboard');
      
    });
    
    
    
  }

}
