var async = require('async');
var fs = require('fs');
var path = require('path');

var Upload = require('./upload');


var Ulozto = function (program, file_manager, clipboard, http) {
  this.$program = program;
  this.$file_manager = file_manager;
  this.$clipboard = clipboard;
  this.$http = http;
};


Ulozto.prototype.uploadFile = function (filename) {
  var file_path = path.resolve(filename);
  if (!fs.existsSync(file_path)) {
    console.error('File not found: %s', file_path);
    return process.exit(1);
  }

  var self = this;
  async.waterfall([
    function (done) {
      self.fetchUploadForm_(function (err, form) {
        if (err) {
          console.error('Failed to fetch the upload form: %s', err.message);
          return process.exit(1);
        }
        done(null, form);
      });
    },

    function (form, done) {
      form.appendFile('upfile_0', file_path);
      self.uploadForm_(form, function (err, upload) {
        if (err) {
          console.error('Failed to upload file: %s', err.message);
          process.exit(1);
        } else {
          console.error('\033[0;32mUpload successful\033[0m');
          done(null, upload);
        }
      });
    },

    function (upload, done) {
      self.$file_manager.add(upload, function (err) {
        if (err) {
          console.error('Failed to save upload info. Please store the links yourself.');
        }

        self.$clipboard.copy(upload.url, function (err) {
          if (err) {
            console.error('  URL: %s', upload.url);
          } else {
            console.error('  URL: %s (copied to clipboard)', upload.url);
          }
          console.error('  Remove URL: %s', upload.remove_url);
          done(null);
        });
      });
    }
  ], function (err) {
    if (err) {
      console.error(err.stack);
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
};


Ulozto.prototype.initFileRemoval = function (query) {
  var self = this;

  async.waterfall([
    function (done) {
      self.$file_manager.searchFiles(query, function (err, uploads) {
        if (err) {
          console.error('Failed to list uploads: %s', err.message);
          return process.exit(1);
        }

        done(null, uploads);
      });
    },

    function (uploads, done) {
      if (uploads.length === 0) {
        console.error('No files');
        process.exit(0);
      }

      var basenames = uploads.map(function (upload) {
        return upload.basename;
      });

      var cmd = new self.$program.Command();
      cmd.choose(basenames, function (index) {
        var upload = uploads[index];
        self.removeFile_(upload, done);
      });
    }
  ], function (err) {
    if (err) {
      console.error('Failed to remove file: ' + err.stack);
      process.exit(1);
    } else {
      console.error('\033[0;32mFile successfully removed\033[0m');
      process.exit(0);
    }
  });
};


Ulozto.prototype.fetchUploadForm_ = function (callback) {
  var self = this;

  var onFormDownloaded = function (err, res, body) {
    if (err) {
      return callback(err, null);
    }

    var action_rx = /multipart\/form-data"\s+action="(.+?)"/;
    var url_match = body.match(action_rx);
    if (!url_match) {
      return callback(new Error('No upload form found'), null);
    }

    var url = url_match[1];
    var form = self.$http.createForm(url);
    callback(null, form);
  };

  this.$http.get('http://uloz.to/upload', onFormDownloaded);
};


Ulozto.prototype.uploadForm_ = function (form, callback) {
  var self = this;

  form.send(function (err, res, body) {
    if (err) {
      return callback(err, null);
    }

    var upload = self.getUploadInfoFromResult_(body);
    if (!upload) {
      return callback(new Error('Failed to read upload info'), null);
    }
    callback(null, upload);
  });
};


Ulozto.prototype.getUploadInfoFromResult_ = function (body) {
  var name_rx = /<h2><a.+?>(.+?)<\/a><\/h2>/;
  var url_rx = /id="frmuploadedForm-\d+-linkShow"\svalue="(.*?)"/;
  var remove_url_rx = /id="frmuploadedForm-\d+-linkDelete"\svalue="(.*?)"/;

  var name_match = body.match(name_rx);
  var url_match = body.match(url_rx);
  var remove_url_match = body.match(remove_url_rx);

  if (!url_match || !remove_url_match) {
    return null;
  }

  var upload = new Upload();
  upload.basename = name_match ? name_match[1] : path.basename(url_match[1]);
  upload.url = url_match[1];
  upload.remove_url = remove_url_match[1];

  return upload;
};


Ulozto.prototype.removeFile_ = function (upload, callback) {
  var self = this;

  var remove_url = upload.remove_url + '?do=delete';
  this.$http.get(remove_url, function (err) {
    self.$file_manager.remove(upload, callback);
  });
};


module.exports = Ulozto;
