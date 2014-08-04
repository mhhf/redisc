Meteor.startup(function(){
  
  SyncedCron.add({
    name: 'notify about updated posts',
    schedule: function(parser) {
      return parser.text('every 4 hourss');
    }, 
    job: function() {
      
      Meteor.users.find().forEach( function(user){
        if( !user.emails || !user.emails[0].address ) {
          //cant notify
          return null;
        }
        var w = user.profile.watch;
        var notify = [];
        var text = "";
        
        _.each(w, function( lastSeen, _id ){
          var atom = Atoms.findOne(_id);
          if( atom.updatedOn > lastSeen ) {
            notify.push(atom);
            text += "  * http://redisc.herokuapp.com/post/"+atom._id+" "+atom.title+" \n";
          }
        });
        
        Meteor.Sendgrid.send({
          to: user.emails[0].address,
          from: 'info@momentum.me',
          subject: '[Redisc] There are Updates!',
          text: 'Hey!\n\nThere new updates on youre subscribed posts:\n\n'+text
        });
        
      });
      
    }
  }); 
  
  
  
  Meteor.Sendgrid.config({
    username: 'app27918601@heroku.com',
    password: 'qx1youit'
  });
  
});
