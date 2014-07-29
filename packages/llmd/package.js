Package.describe({
  summary: "A ll-flavored-markdown parser and compiler."
});

Package.on_use(function (api) {
  
  api.use('templating', 'client');
  api.use("ui", "client");
  api.use("marked", "client", {weak: true});
  
  api.add_files('llmd.html','client');
  api.add_files("llmd.js",'client');

});
