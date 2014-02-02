var fs = require('fs');


var Form = function (http, url, form_data) {
  this.$http = http;

  this.url_ = url;
  this.form_data_ = form_data;
};


Form.prototype.append = function (key, value) {
  return this.form_data_.append.apply(this.form_data_, arguments);
};


Form.prototype.appendFile = function (key, filename) {
  var stream = fs.createReadStream(filename);
  var stat = fs.statSync(filename);

  return this.form_data_.append(key, stream, {
    knownLength: stat.size
  });
};


Form.prototype.send = function (callback) {
  var self = this;

  this.form_data_.submit(this.url_, function (err, res) {
    if (err) {
      return callback(err, res, null);
    }

    var status = res.statusCode;
    if (status === 301 || status === 302) {
      var redirect_url = res.headers['location'];
      return self.$http.get(redirect_url, callback);
    }

    var body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      callback(null, res, body);
    });
  });
};


module.exports = Form;
