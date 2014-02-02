
var Form = require('./form');
var FormData = require('form-data');


var Http = function (request) {
  this.$request = request;
};


Http.prototype.get = function () {
  return this.$request.get.apply(this.$request, arguments);
};


Http.prototype.post = function () {
  return this.$request.post.apply(this.$request, arguments);
};


Http.prototype.put = function () {
  return this.$request.put.apply(this.$request, arguments);
};


Http.prototype.patch = function () {
  return this.$request.patch.apply(this.$request, arguments);
};


Http.prototype.del = function () {
  return this.$request.del.apply(this.$request, arguments);
};


Http.prototype.head = function () {
  return this.$request.head.apply(this.$request, arguments);
};


Http.prototype.createForm = function (url) {
  var form_data = new FormData();
  var form = new Form(this, url, form_data);

  return form;
};


module.exports = Http;
