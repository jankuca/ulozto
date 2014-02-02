var fs = require('fs');
var path = require('path');

var Upload = require('./upload');


var FileManager = function (db_path) {
  if (!db_path) {
    throw new Error('Database path not specified');
  }

  db_path = db_path.replace(/^~\//, process.env['HOME'] + '/');
  this.db_path_ = path.resolve(db_path);
};


FileManager.prototype.add = function (upload, callback) {
  var self = this;

  this.loadDb_(function (err) {
    if (err) {
      return callback(err);
    }

    self.db_.push(upload);
    self.saveDb_(callback);
  });
};


FileManager.prototype.remove = function (upload, callback) {
  var self = this;

  this.loadDb_(function (err) {
    if (err) {
      return callback(err);
    }

    self.db_ = self.db_.filter(function (row) {
      return !row.equals(upload);
    });
    self.saveDb_(callback);
  });
};


FileManager.prototype.searchFiles = function (query, callback) {
  var self = this;
  this.loadDb_(function (err) {
    if (err) {
      return callback(err);
    }

    var results = self.db_.filter(function (row) {
      return !row.matches(query);
    });
    callback(null, results);
  });
};


FileManager.prototype.loadDb_ = function (callback) {
  var db_path = this.db_path_;
  if (!fs.existsSync(db_path)) {
    this.db_ = [];
    this.saveDb_(callback);
    return;
  }

  var self = this;

  fs.readFile(db_path, function (err, db_raw) {
    if (err) {
      callback(err);
    }

    self.db_ = JSON.parse(db_raw, function (key, value) {
      if (typeof value === 'object' && value.url && value.basename) {
        return new Upload(value);
      }
      return value;
    });

    callback(null);
  });
};


FileManager.prototype.saveDb_ = function (callback) {
  var db_path = this.db_path_;
  var db_raw = JSON.stringify(this.db_);

  fs.writeFile(db_path, db_raw, callback);
};


module.exports = FileManager;
