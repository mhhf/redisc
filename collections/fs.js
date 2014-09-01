FS.debug = false;

S3Store = new FS.Store.S3("files", {
    region: "us-west-2", 
    bucket: "ll-poc",
    folder: 'f',
    ACL: 'public-read'
  });

Files = new FS.Collection("files", {
  stores: [S3Store]
});

Files.allow({
  insert: function(userId) {
    return !!userId;
  },
  update: function(userId) {
    return !!userId;
  },
  remove: function(userId) {
    return !!userId;
  },
  download: function(userId) {
    return true;
  },
  fetch: []
});

