Package.describe({
  summary: "Jison + Custom Lex Parser"
});

Npm.depends({ 
  "jison": "0.4.14",
  "lex": "1.7.6"
});

Package.on_use(function (api) {
  api.add_files("parser.js", "server");
  
  if (api.export) 
    api.export('Parser');
});

