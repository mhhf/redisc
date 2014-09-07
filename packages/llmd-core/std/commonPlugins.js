IFPlugin = BasicPlugin.extend({
  // export to server? async?
  build: function( ctx, last ){
    
    var val = this.c && this.c.key && ctx.context[this.c.key];
    
    // check if value is there
    if( val == null && !last ) return false;
    
    if( val ) {
      return this.t;
    } else {
      return this.f;
    }
    
  },
  astTemplate: 'llmd_ast_if'
});


PluginHandler.registerPlugin( 'if', IFPlugin );

Template.llmd_if_edit.rendered = function(){
  
  var self = this;
  
  this.data.buildAtom = function(){
    return {
      name: 'if',
      c: self.find('input[name=condition]').value,
      t: self.data.atom.t,
      f: self.data.atom.f
    }
  }
}

Template.llmd_if_body.helpers({
  wrapData: function( d,a ){
    return { 
      atom: {
        data: d
      },
      editorModel: this.editorModel
    };
  }
});


Template.llmd_seq_edit.rendered = function(){
  // new Sortable(this.find('#editorContainer'), {
  //   handle: '.sort-handle',
  //   onUpdate: function(e,a){
  //     var oldPos = e.srcElement.dataset.index;
  //     var newPos = e.srcElement.previousElementSibling && e.srcElement.previousElementSibling.dataset.index - 1 || 0;
  //     var parent = e.srcElement.parentElement;
  //     console.log(e);
  //   },
  //   group: 'seq'
  // });
}

Template.llmd_seq_edit.helpers({
  getData: function( ctx ){
    // console.#log('ctx',ctx);
    var wrappedAtom = ctx.editorModel.wrapAtom( this, ctx.parents.concat([ ctx.atom._id ]) ); 
    return wrappedAtom;
    
    // return {
    //   atom: this,
    //   index: ctx.atom.data.indexOf(this._id),
    //   parents: ,
    //   commit: ctx.commit,
    //   editor: ctx.editor
    // }
  },
  isComment: function(){
    return this.name === 'comment';
  },
  atoms: function(){
    // var atoms = _.map( this.atom.data, function(_id,a){
    //   var atom = Atoms.findOne({_id: _id});
    //   return atom;
    // });
    // 
    console.log(this);
    if( !this.key ) return this.get().data;
    return this.get()[this.key];
  }
})






// BASIC PRIMITIVES
//
//
//
// STRING

// Template.llmd_string_edit.rendered = function(){
//   
//   var self = this;
//   
//   this.data.buildAtom = function(){
//     return {
//       key: self.find('input[name=value]').value,
//     }
//   }
// }
// 
// Template.llmd_string_edit.helpers({
//   value: function(){
//     return this.get().value;
//   }
// });

Template.llmd_string_ast.helpers({
  value: function(){
    var val = this.get().value;
    return val || 'undefined';
  }
});


//  NAME
//
//

Template.llmd_name_edit.rendered = function(){
  
  var self = this;
  
  this.data.buildAtom = function(){
    return {
      key: self.find('input[name=key]').value
    }
  }
} 


Template.llmd_name_ast.helpers({
  key: function(){
    var key = this.get().key;
    return ( key != '')? key : 'undefined';
  }
});

Template.llmd_edit.helpers({
  omitFields: function(){
    return ['owner','updatedOn','pro','con','score'];
  }
});



Template.llmd_nested.helpers({
  atoms: function(){
    console.log(this);
    return this.atom.getNested(this.key);
  },
  getWrapper: function(){
    console.log('n',this);
    var name = this.get().name;
    console.log(name);
    if( name === 'comment') {
      return Template['commentWrapper'];
    } else if( name === 'seq' ) {
      if( this.meta && this.meta.state == 'conflict' ) {
        console.log('merge');
        return Template['atomWrapper'];
      } else {
        console.log('merge', this);
        return Template['atomWrapper'];
      }
    } else {
      if( this.meta && this.meta.state == 'conflict' && !LLMD.Package( name ).nested ) {
        if( this.meta.diff.type == 'remove') {
          return Template['removeWrapper'];
        } else if( this.meta.diff.type == 'add') {
          return Template['addWrapper'];
        } else {
          return Template['diffWrapper'];
        }
      } else {
        return Template['atomWrapper'];
      }
    }
  },
});


AutoForm.addHooks('customEdit', {
  onSubmit: function (o, t, _a) {
    this.event.preventDefault();
    
    var id =  _a._id;
    var atom = new AtomModel( id );
    atom.update(o);
    
    AtomModel.set('INIT');
    
  }
}, true);
