UI.registerHelper('isEditing', function(){
  var atom = AtomModel.get('EDIT') || AtomModel.get('ADD');
  return atom == this;
});

UI.registerHelper('getSchema', function(){
  return new SimpleSchema(LLMD.Package(this.get().name).shema);
});

UI.registerHelper('getSchemaFor', function( name ){
  return new SimpleSchema(LLMD.Package( name ).shema);
});

UI.registerHelper('getProperty', function(k){
  return this.get()[k];
});

UI.registerHelper('editableAtom', function(){
  return this.hasMajority();
});
