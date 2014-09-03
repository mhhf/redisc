Meteor.methods({
  'mail.test': function(){
    
    Meteor.Sendgrid.send({
      to: 'denis.erfurt@gmail.com',
      from: 'super-ego@brainfilm.me',
      subject: 'test',
      text: 'omgomgomg'
    });
    
  },
  'mail.fire': function(){
    
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
            text += "  * <a href=\"http://redisc.herokuapp.com/post/"+atom._id+"\"> "+atom.title+" </a>\n";
          }
        });
        
        console.log( text );
        
        // Meteor.Sendgrid.send({
        //   to: user.emails[0].address,
        //   from: 'info@momentum.me',
        //   subject: '[Redisc] There are Updates!',
        //   text: 'Hey!\n\nThere new updates on youre subscribed posts:\n\n'+text
        // });
        
      });
  },
  'reset': function(){
    Atoms.remove({});
    Meteor.users.remove({});
    GlobalTags.remove({});
    Owners.remove({});
  },
  'create.test': function(){
    var seq = new AtomModel(new LLMD.Atom('seq'));
    var name = seq.addAfter('data', new LLMD.Atom('name'));
    var title = name.addAfter('value', new LLMD.Atom('string'))
    console.log(seq.get()._id);
  } 
});
