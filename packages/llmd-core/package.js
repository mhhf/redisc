Package.describe({
  summary: "LiquidLearning Core Package",
  version: '0.1.0',
  name: 'llmd-core'
});


var s = 'server';
var c = 'client';
var b = ['client','server']

Package.on_use(function (api) {
  
  api.use('templating',c);
  api.use('less',c);
  api.use('deps',c);
  api.use('accounts-base',b);
  api.use('accounts-password',b);
  api.use('ui',c);
  api.use('blaze',c);
  api.use('minimongo',b);
  api.use('kestanous:emitter',b);
  api.use('crypto',b);
  api.use('aldeed:collection2@1.0.0',b);
  api.use('aldeed:autoform@1.0.0',c);
  
  api.add_files("llmd.js", b);
  api.add_files("atomModel.js", b);
  api.add_files("compilers.js", b);
  
  api.add_files("methods.js", s);
  
  api.add_files("plugin.js", c);
  api.add_files("handler.js", c);
  
  api.add_files("std/common.js", b);
  api.add_files("std/commonPlugins.html", c);
  api.add_files("std/commonPlugins.less", c);
  api.add_files("std/commonPlugins.js", c);
  api.add_files("std/commonHelpers.js", c);
  

  if (api.export) {
    api.export('LLMD');
    api.export('BasicPlugin');
    api.export('PluginHandler');
    api.export('AtomModel');
    api.export('Atoms');
  }
  
});

Package.onTest( function(api){
  api.use(['llmd-core', 'tinytest', 'test-helpers', 'gfk:munit']); 
  
  api.use('accounts-base',b);
  api.use('accounts-password',b);
  
  api.add_files('tests/compiler.js', b);
  api.add_files('tests/atomModel.js', b);
});
