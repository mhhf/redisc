Package.describe({
  summary: 'JavaScript implementations of standard and secure cryptographic algorithms',
  version: '3.1.2'
});

Package.on_use(function (api) {

  api.add_files('core-min.js', ['client','server']);
  api.add_files('sha3.js', ['client','server']);

  api.export('CryptoJS')
});
