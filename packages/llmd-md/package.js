Package.describe({
  summary: "LLMD Plugin - Markdown" 
});

Package.on_use(function (api) {
  api.use('llmd-core',['client','server']);
  
  api.use('templating', 'client');
  api.use('minimongo', ['client','server']);
  api.use('less', 'client');
  
  
  api.use('marked','client');
  
  
  api.add_files("md.js", ["client","server"]);
  api.add_files("mdView.html", ["client"]);
  api.add_files("mdPlugin.js", ["client"]);

});
