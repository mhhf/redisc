Package.describe({
  summary: "Redisc Blog Plugin - Blog plugin for lifet.me",
  version: "0.1.0"
});

Package.on_use(function (api) {
  api.versionsFrom("METEOR@0.9.0");
  api.use('llmd-core',['client','server']);
  
  api.use('templating', 'client');
  api.use('minimongo', ['client','server']);
  api.use('less', 'client');
  api.use('editor', 'client');
  
  
  api.use('llmd','client');
  
  
  api.add_files("blog.js", ["client","server"]);
  api.add_files("blogView.html", ["client"]);
  api.add_files("blogView.js", ["client"]);
  api.add_files("blogView.less", ["client"]);

});
