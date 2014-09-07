UI.registerHelper('isEditing', function(){
  var atom = AtomModel.get('EDIT') || AtomModel.get('ADD');
  return atom == this;
});
