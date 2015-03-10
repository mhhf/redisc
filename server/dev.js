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
    var a1 = new AtomModel(new LLMD.Atom('name',{key:'model'}));
    var hero = a1.push( new LLMD.Atom('name', {key:'hero'}) );
    var heroName = hero.push( new LLMD.Atom('name',{key:'name'}));
    var heroNameString = heroName.push( new LLMD.Atom('string',{value:'hero'}));
    var heroHead = hero.push( new LLMD.Atom('name',{key:'headline'}));
    var heroHeadString = heroHead.push( new LLMD.Atom('string',{value:'LifeT.me'}));
    var heroSHead = hero.push( new LLMD.Atom('name',{key:'subheadline1'}));
    var heroSHeadString = heroSHead.push( new LLMD.Atom('string',{value:'Gesundheit ist Lebenszeit'}));
    var heroSHead2 = hero.push( new LLMD.Atom('name',{key:'subheadline2'}));
    var heroSHead2String = heroSHead2.push( new LLMD.Atom('string',{value:'Dein verlässlicher Begleiter immer an Deiner Seite.'}));
    var blog = a1.push( new LLMD.Atom('name', { key: 'blog' } ));
    var blogVar = blog.push( new LLMD.Atom('var', { key: 'blog' } ));
    return a1.getId();
  }
});
