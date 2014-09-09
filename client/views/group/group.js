Template.group.rendered = function(){
  
  var data = _.map(this.data.group.distribution, function( e ){
    return [ e._userId, e.shares ];
  });

  var chart = c3.generate({
    bindto: this.find('.chart'),
    data: {
        // iris data from R
        columns: data,
        type : 'pie',
        onclick: function (d, i) { console.log("onclick", d, i); },
        onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    }
  });
}

var adding = {
  dep:	new Deps.Dependency,
  val: false,
  get: function(){
    this.dep.depend();
    return this.val;
  },
  set: function( val ){
    this.dep.changed();
    this.val = val;
  }
}

Template.groupNamespace.helpers({
  names: function(){
    var names = new AtomModel( this.group.ctx );
    var atoms = names.getNested('data');
    return atoms;
  },
  adding: function(){
    return adding.get();
  },
  nameSchema: function(){
    return new SimpleSchema(LLMD.Package( 'name' ).shema);
  },
  nameField: function(){
    return ['key'];
  }
});

Template.groupNamespace.events = {
  "click .new-name-btn": function(e,t){
    e.preventDefault();
    
    adding.set(true);

  },
  "submit": function(e,t){
    e.preventDefault();
    adding.set(false);

    var val = t.find('input[name=key]').value;
    var a = new AtomModel( this.group.ctx );
    var name = a.push( new LLMD.Atom( 'name', {key: val} ) );
    
  }
};


Template.groupDeligations.helpers({
  deligations: function(){
    return [1,2,3];
  }
});

