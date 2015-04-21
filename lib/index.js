var under = require('underscore'),
    parse = require('url-parse'),
    redis = require("redis");

module.exports = function HipacheCtl(){
    this.redis = redis;
    //this.client = redis.createClient.apply(redis, arguments);
};

module.exports.prototype.formatUrl = function formatUrl(vhost){
    var parsed = parse(vhost);
    parsed.protocol = under.contains(['http:', 'https:'], parsed.protocol) ? parsed.protocol : (parsed.port === '443' ? 'https' : 'http') + ':';
    parsed.port = under.contains(['80', '443'], parsed.port) ? '' : parsed.port;
    return parsed.toString();
};
