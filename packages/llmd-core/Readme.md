# Usage

Extend your own plugin from the basic plugin:
```
MyPlugin = BasicPlugin.extend({
  init: function(){ /* initialize the plugin */ },
  build: function( ctx ){ return ast; },
  load: function( ctx, cb ) { cb(); },
  execute: function( cb ) { cb(); },
  render: function(){ return node; },
  blocking: true,
  template: 'pkg_pluginTemplate',
  tmp: true
});
```

## Callbacks
### build
Binds the ast to the given context. 
Retuns eather `true`, if the ast was bound and cleaned up, `array` of asts if the ast resolve to nested asts or `null` if this ast should be ignorred.
### load
Async Loads the Plugin in the background. 
This is a blocking function: the process continues when `cb()` is called.
### execute
Run the Plugin asyncroniusly.
This is a blocking function: the process continues when `cb()` is called.
### render
Render a node element
### blocking
Indicates if the execution is blocking the interpreter untill `plugin.unblock()` is called.
### template
name of the rendered tepmlate
### tmp
bool value, indicates if the rendered plugin is removed after the display
