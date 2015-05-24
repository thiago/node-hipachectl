/*jshint -W079 */

var _ = require('underscore'),
  parse = require('url-parse'),
  Promisse = require('bluebird');

function HipacheCtl(client) {
  if (!client) {
    throw new Error('You must especify a redis client');
  }
  this.client = Promisse.promisifyAll(client);
  this.frontendPrefix = 'frontend:';
}

/**
 *
 * @param frontend
 * @returns {*}
 */
HipacheCtl.prototype.find = function find(frontend) {
  var self = this;
  if (typeof frontend !== 'string') {
    return Promisse.reject(new Error('Frontend must be a string'));
  }

  var backends = Array.prototype.slice.call(arguments),
    frontendFormated;
  backends.shift();
  backends = _.uniq(backends);

  return self.formatFrontend(frontend)
    .then(function (_frontendFormated) {
      frontendFormated = _frontendFormated;
      return self.client.keysAsync(frontendFormated);
    })
    .then(function (found) {
      if (!found.length) {
        return null;
      } else {
        return self.client.lrangeAsync(frontendFormated, 0, -1)
          .then(function (hosts) {
            if (backends.length === 0 || hosts.length === 0) {
              return hosts;
            }

            return Promisse.map(backends, function (ip) {
              return self.formatBackend(ip).catch(function () {
                return '';
              });
            })
              .then(function (backends) {
                var added = [];
                _.each(backends, function (backend) {
                  if (backend && _.contains(hosts, backend) && !_.contains(added, backend)) {
                    added.push(backend);
                  }
                });
                return added;
              });
          });
      }
    });
};

HipacheCtl.prototype.add = function add(frontend) {
  var self = this;
  if (arguments.length < 2) {
    return Promisse.reject(new Error('You must specify at least one address'));
  }

  var backends = Array.prototype.slice.call(arguments),
    formated, found;
  backends.shift();
  backends = _.uniq(backends);
  var args = arguments;

  return  self.formatFrontend(frontend)
    .then(function (_formated) {
      formated = _formated;
      return self.find.apply(self, args);
    })
    .then(function (has) {
      if (has === null) {
        return self.client.rpushAsync(formated, frontend)
          .then(function () {
            return self.find.apply(self, args);
          });
      }
      return Promisse.resolve(has);
    })
    .then(function (_found) {
      found = _found;
      return Promisse.map(backends, function (backend) {
        return self
          .formatBackend(backend)
          .catch(function () {
            return '';
          });
      });
    })
    .then(function (formatedList) {
      var notCreated = _.difference(formatedList, found);
      if (notCreated.length > 0) {
        return Promisse.map(notCreated, function (backend) {
          return Promisse.all([self.formatFrontend(frontend), self.formatBackend(backend)])
            .then(function (formated) {
              return self.client.rpushAsync(formated[0], formated[1]);
            })
            .then(function () {
              return backend;
            });
        });
      } else {
        return found;
      }
    });
};

HipacheCtl.prototype.rename = function rename(frontend, newFrontend) {
  var self = this;
  if (arguments.length < 2) {
    return Promisse.reject(new Error('You must specify current frontend and new frontend'));
  }
  var formated, newFormated;
  return self
    .formatFrontend(frontend)
    .then(function (val) {
      formated = val;
      return self.formatFrontend(newFrontend);
    })
    .then(function (val) {
      newFormated = val;
      return self.client.renameAsync(formated, val);
    })
    .then(function () {
      return newFormated;
    });
};

HipacheCtl.prototype.remove = function remove(frontend) {
  var self = this;
  if (arguments.length < 1) {
    return Promisse.reject(new Error('You must specify a frontend'));
  }
  if (arguments.length < 2) {
    return self.formatFrontend(frontend)
      .then(function (formated) {
        return self.client.delAsync(formated);
      })
      .then(function () {
        return frontend;
      });
  }

  var backends = Array.prototype.slice.call(arguments);
  backends.shift();
  backends = _.uniq(backends);
  return self.formatFrontend(frontend)
    .then(function (frontend) {
      return Promisse.map(backends, function (backend) {
        return self.formatBackend(backend)
          .then(function (backendFormated) {
            return self.client.lremAsync(frontend, 0, backendFormated);
          })
          .then(function (removed) {
            if (removed === 1) {
              return backend;
            }
          });
      });
    })
    .then(function (returned) {
      return _.reject(returned, function (val) {
        return !val;
      });
    });
};

HipacheCtl.prototype.formatFrontend = function formatFrontend(frontend) {
  if (!frontend) {
    return Promisse.reject(new Error('You must specify a frontend'));
  }
  if (typeof frontend !== 'string') {
    return Promisse.reject(new Error('Frontend must be a string'));
  }
  return Promisse.resolve(this.frontendPrefix + frontend);
};

HipacheCtl.prototype.formatBackend = function formatBackend(backend) {
  if (!backend) {
    return Promisse.reject(new Error('You must specify a backend'));
  }
  if (typeof backend !== 'string') {
    return Promisse.reject(new Error('Backend must be a string'));
  }
  var parsed = parse(backend);
  parsed.protocol = _.contains(['http:', 'https:'], parsed.protocol) ? parsed.protocol : (parsed.port === '443' ? 'https' : 'http') + ':';
  parsed.port = _.contains(['80', '443'], parsed.port) ? '' : parsed.port;
  return Promisse.resolve(parsed.toString());
};

HipacheCtl.prototype.formatHost = function formatHost() {
  console.warn('This function is deprecated use formatFrontend');
  return this.formatFrontend.apply(this, arguments);
};

HipacheCtl.prototype.formatUrl = function formatUrl() {
  console.warn('This function is deprecated use formatBackend');
  return this.formatBackend.apply(this, arguments);
};

module.exports = HipacheCtl;
