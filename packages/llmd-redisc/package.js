Package.describe({
  summary: "Redisc Plugin - Reddit like discussions Markdown" 
});

Package.on_use(function (api) {
  api.use('llmd-core',['client','server']);
  
  api.use('templating', 'client');
  api.use('minimongo', ['client','server']);
  api.use('less', 'client');
  
  
  api.use('llmd','client');
  
  
  api.add_files("redisc.js", ["client","server"]);
  api.add_files("rediscView.html", ["client"]);
  api.add_files("rediscView.js", ["client"]);

});
