Package.describe({
  summary: "A ll-flavored-markdown parser and compiler.",
  version: "0.1.0",
  git: "https://github.com/mhhf/llmd.git"
});

Package.on_use(function (api) {
  api.versionsFrom("METEOR@0.9.0");
  
  api.use('templating', 'client');
  api.use("ui", "client");
  api.use("chuangbo:marked@0.3.3", "client", {weak: true});
  
  api.add_files('llmd.html','client');
  api.add_files("llmd.js",'client');

});
