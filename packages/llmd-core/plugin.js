BasicPlugin = function( ){
  this._block = true;
  this._run = false;
  this._build = false;
  this._container = false;
  
};

BasicPlugin.prototype._loaded = false;
BasicPlugin.prototype.load = function(){
  this._loaded = true;
  return {then:function(cb1,cb2){cb1(true);}};
}
BasicPlugin.prototype.execute = function(){
  this._block = !!this.blocking;
}
BasicPlugin.prototype.build = function(ctx){
  return true;
}

BasicPlugin.prototype.buildWrapper = function(ctx, last){
  var build = this.build(ctx, last);
  
  this._build = !!build;
  
  return build;
  
}

// [TODO] - rename init to loading?
BasicPlugin.prototype.loadingWrapper = function(ctx){
  
  var self = this;
  return new Promise(function(resolve) {

    self.load.apply(self, [ctx, function(){
      
      self._loaded = true;
      resolve();
    }]);

  });
}

BasicPlugin.prototype.renderWrapper = function(){
  if( this.template ) 
    this.ui = UI.renderWithData( Template[ this.template ], this);
  
  this.domNode = this.render && this.render();
  
  return !!this.ui || !!this.domNode;
}

// TODO: timeout?
BasicPlugin.prototype.executeWrapper = function( ctx, execute ){
  
  this._run = true;
  var self = this;
  
  // execute();
  
  var promise = new Promise( function(resolve){
    
    self.executeCallback = function(){
      self._unblock();
      resolve()
    };
    
    self.execute.apply( self, [ ctx, self.executeCallback] );

  });
  
  if(this.blocked === false) this.unblock();
  
  return promise; 
  
};


BasicPlugin.prototype.isLoaded = function(){
  return this._loaded;
}
BasicPlugin.prototype.isRun = function(){
  return this._run;
}
BasicPlugin.prototype.isBuild = function(){
  return this._build;
}

BasicPlugin.prototype.isUnblocked = function(){
  return !this._block;
}
BasicPlugin.prototype.isBlocked = function(){
  return this._block;
}

BasicPlugin.prototype.block = function(){
  this._block = true;
}
BasicPlugin.prototype._unblock = function(){
  this._block = false;
}
BasicPlugin.prototype.unblock = function(){
  this.executeCallback && this.executeCallback();
}




BasicPlugin.extend = function(properties){
  var Plugin = function( o, ctx ){
    this.ctx = ctx;
    for(var k in o) {
      this[k] = o[k];
    }
    
    this.init && this.init();
  }
  Plugin.prototype = new BasicPlugin();
  
  for(var k in properties ) {
    Plugin.prototype[k] = properties[k];
  }
  
  return Plugin;
}
