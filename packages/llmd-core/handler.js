PluginHandler = {
  plugin:[],
  registerPlugin: function( name, cl ){
    PluginHandler.plugin[name] = cl;
  }
}
