Template.register1.helpers({
  
  getEmail: function(){
    return Meteor.user() && Meteor.user().emails && Meteor.user().emails[0].address;
  },

  getUsername: function(){
    return Meteor.user() && Meteor.user().profile && Meteor.user().profile.name;
  },
  
  getIdentification: function(){
    return Meteor.user() && Meteor.user().profile && Meteor.user().profile.id;
  }
  
});


Template.register1.events ={
  
  "submit": function(e,t){
    e.preventDefault();
    
    var valide = true;
    var email = t.find('input#email').value;
    var name = t.find('input#username').value;
    var id = t.find('input#id').value;
    
    if( !email || email.indexOf('@') == -1 ) {
      $('input#email').addClass('required');
      valide = false;
    } 
    
    if( !name ) {
      $('input#username').addClass('required');
      
      valide = false;
    } 
    
    if( !id) {
      $('input#id').addClass('required');
      
      valide = false;
    } 
    
    if(!valide) return null;
    
    Meteor.call('user.register1',{
      name: name,
      email: email,
      id: id
    }, function( err, succ ){
      // [TODO] - check if username && email is taken
      
      Router.go('Home');
      
    });
    
    
    
  }

}
