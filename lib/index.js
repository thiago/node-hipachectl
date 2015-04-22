/*jshint -W079 */

var _ = require('underscore'),
  parse = require('url-parse'),
  Promisse = require('bluebird');

function Host(name) {
  this.name = name;
}

Host.prototype = [];

function HipacheCtl(client) {
  if (!client) {
    throw new Error('You must especify a redis client');
  }
  this.client = Promisse.promisifyAll(client);
  this.hostnamePrefix = 'frontend:';
}


HipacheCtl.prototype = [];
HipacheCtl.prototype.find = function (hostname) {
  var self = this;
  if (typeof hostname !== 'string') {
    return Promisse.reject(new Error('Hostname must be a string'));
  }

  var ips = Array.prototype.slice.call(arguments);
  ips.shift();
  ips = _.uniq(ips);
  return this.client.lrangeAsync(this.hostnamePrefix + hostname, 0, -1)
    .then(function (hosts) {
      if (ips.length === 0 || hosts.length === 0) {
        return hosts;
      }
      var added = [];
      _.each(ips, function (ip) {
        var cIp = self.formatUrl(ip);
        if(_.contains(hosts, cIp) && !_.contains(added, cIp)){
         added.push(ip);
        }
      });

      return added;
    });
};

HipacheCtl.prototype.push = function (hostname) {
  var self = this;
  if (arguments.length < 2) {
    return Promisse.reject(new Error('You must specify at least one address'));
  }

  var args = Array.prototype.slice.call(arguments);
  args.shift();


  return self.find.apply(this, arguments)
    .then(function (ips) {
      var notCreated = _.difference(args, ips);
      if (notCreated.length > 0) {
        return new Promisse.all(
          _.map(notCreated, function (ip) {
            return self.client.rpushAsync(self.hostnamePrefix + hostname, self.formatUrl(ip));
          })
        );
      }
    });
};

HipacheCtl.prototype.formatUrl = function formatUrl(vhost) {
  if (!vhost) {
    return null;
  }
  var parsed = parse(vhost);
  parsed.protocol = _.contains(['http:', 'https:'], parsed.protocol) ? parsed.protocol : (parsed.port === '443' ? 'https' : 'http') + ':';
  parsed.port = _.contains(['80', '443'], parsed.port) ? '' : parsed.port;
  return parsed.toString();
};

module.exports = HipacheCtl;
