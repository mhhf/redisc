UI.registerHelper('isEditing', function(){
  var atom = AtomModel.get('EDIT') || AtomModel.get('ADD');
  return atom == this;
});

UI.registerHelper('getSchema', function(){
  console.log(LLMD.Package(this.get().name).shema);
  return new SimpleSchema(LLMD.Package(this.get().name).shema);
});
