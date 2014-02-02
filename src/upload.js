

var Upload = function (data) {
  data = data || {};

  this.basename = data['basename'] || null;
  this.url = data['url'] || null;
  this.remove_url = data['remove_url'] || null;
  this.tags = data['tags'] || [];

  var ts = data['created_at'];
  this.created_at = (typeof ts !== 'undefined') ? new Date(ts) : new Date();
};


Upload.prototype.toJSON = function () {
  return {
    'url': this.url,
    'remove_url': this.remove_url,
    'tags': this.tags,
    'created_at': this.created_at
  };
};


Upload.prototype.equals = function (b) {
  return (b.url === this.url);
};


Upload.prototype.matches = function (query) {
  var query_rx = new RegExp('(^|\\W)' + query, 'gi');

  return Boolean(this.basename.match(query_rx));
};


module.exports = Upload;
