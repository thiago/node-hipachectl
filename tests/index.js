var HipacheCtl = require('../lib'),
  url = require('url'),
  demand = require('must'),
  redis = require("redis"),
  REDIS_URL = url.parse(process.env.REDIS_PORT_6379 || process.env.REDIS_URL || 'tcp://redis:6379'),
  REDIS_HOSTNAME = REDIS_URL.hostname,
  REDIS_PORT = REDIS_URL.port;


var client, hipache;

before(function () {
  client = redis.createClient(REDIS_PORT, REDIS_HOSTNAME);
  hipache = new HipacheCtl(client);
});

beforeEach(function (done) {
  client.flushdb(function () {
    done();
  });
});

after(function () {
  client.quit();
});

describe('Test startup', function () {

  it('HipacheCtl exist', function () {
    demand(HipacheCtl).exist();
    demand(HipacheCtl).to.be.a.function();
  });

  it('Instance not exist without client', function () {
    demand(HipacheCtl).must.throw();
  });

  it('Instance exist with client', function () {
    var hipache = new HipacheCtl(client);
    demand(hipache).to.be.an.instanceof(HipacheCtl);
  });
});

describe('hipache.formatFrontend', function () {

  it('catch without frontend', function (done) {
    hipache.formatFrontend()
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('frontend must be a string', function (done) {
    hipache.formatFrontend([])
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        return hipache.formatFrontend(true);
      })
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        return hipache.formatFrontend({});
      })
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('format frontend', function (done) {
    hipache.formatFrontend('www.mysite.com')
      .then(function (value) {
        demand(value).to.equal(hipache.frontendPrefix + 'www.mysite.com');
        done();
      });
  });
});

describe('hipache.formatBackend', function () {
  it('catch without backend', function (done) {
    hipache.formatBackend()
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('backend must be a string', function (done) {
    hipache.formatBackend([])
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        return hipache.formatBackend(true);
      })
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        return hipache.formatBackend({});
      })
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('without protocol and port', function (done) {
    hipache.formatBackend('127.0.0.1')
      .then(function (value) {
        demand(value).to.equal('http://127.0.0.1');
        done();
      });
  });

  it('with protocol', function (done) {
    hipache.formatBackend('http://127.0.0.1')
      .then(function (value) {
        demand(value).to.equal('http://127.0.0.1');
        done();
      });
  });

  it('with port 8000', function (done) {
    hipache.formatBackend('127.0.0.1:8000')
      .then(function (value) {
        demand(value).to.equal('http://127.0.0.1:8000');
        done();
      });
  });

  it('with protocol and port 8000', function (done) {
    hipache.formatBackend('http://127.0.0.1:8000')
      .then(function (value) {
        demand(value).to.equal('http://127.0.0.1:8000');
        done();
      });
  });

  it('with port 443', function (done) {
    hipache.formatBackend('127.0.0.1:443')
      .then(function (value) {
        demand(value).to.equal('https://127.0.0.1');
        done();
      });
  });

  it('with protocol https', function (done) {
    hipache.formatBackend('https://127.0.0.1')
      .then(function (value) {
        demand(value).to.equal('https://127.0.0.1');
        done();
      });
  });

  it('with protocol https and port 443', function (done) {
    hipache.formatBackend('https://127.0.0.1:443')
      .then(function (value) {
        demand(value).to.equal('https://127.0.0.1');
        done();
      });
  });

  it('with protocol https and port 8000', function (done) {
    hipache.formatBackend('https://127.0.0.1:8000')
      .then(function (value) {
        demand(value).to.equal('https://127.0.0.1:8000');
        done();
      });
  });

  it('with protocol tcp', function (done) {
    hipache.formatBackend('tcp://127.0.0.1')
      .then(function (value) {
        demand(value).to.equal('http://127.0.0.1');
        done();
      });
  });

  it('with protocol tcp and port 443', function (done) {
    hipache.formatBackend('tcp://127.0.0.1:443')
      .then(function (value) {
        demand(value).to.equal('https://127.0.0.1');
        done();
      });
  });
});

describe('hipache.find', function () {
  it('catch without frontend', function (done) {
    hipache
      .find()
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('frontend don\'t exist', function (done) {
    hipache
      .find('notexist.com')
      .then(function (hosts) {
        demand(hosts).to.be.a.null();
        return hipache.find('notexist.com', '127.0.0.1');
      })
      .then(function (hosts) {
        demand(hosts).to.be.a.null();
        done();
      });
  });

  it('with frontend', function (done) {
    hipache
      .client.rpushAsync('frontend:hipachectl.com', 'http://127.0.0.1')
      .then(function () {
        return hipache.find('hipachectl.com');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(1);
        return hipache.find('hipachectl.com', '127.0.0.1');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(1);
        demand(hosts).to.include('http://127.0.0.1');
        done();
      });
  });

  it('not found a backend', function (done) {
    hipache
      .client.rpushAsync('frontend:hipachectl.com', 'http://127.0.0.1')
      .then(function () {
        return hipache.find('hipachectl.com');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(1);
        return hipache.find('hipachectl.com', '127.0.0.2');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(0);
        done();
      });
  });

  it('with two backends', function (done) {
    hipache
      .client.rpushAsync('frontend:hipachectl.com', 'http://127.0.0.1')
      .then(function () {
        return hipache.client.rpushAsync('frontend:hipachectl.com', 'http://127.0.0.2');
      })
      .then(function () {
        return hipache.find('hipachectl.com');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(2);
        return hipache.find('hipachectl.com', '127.0.0.1');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(1);
        demand(hosts).to.include('http://127.0.0.1');
        return hipache.find('hipachectl.com', '127.0.0.1', '127.0.0.2');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(2);
        demand(hosts).to.include('http://127.0.0.1');
        demand(hosts).to.include('http://127.0.0.2');
        return hipache.find('hipachectl.com', '127.0.0.1', '127.0.0.3');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(1);
        demand(hosts).to.include('http://127.0.0.1');
        return hipache.find('hipachectl.com', '127.0.0.1', '127.0.0.2', '127.0.0.3');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(2);
        demand(hosts).to.include('http://127.0.0.1');
        demand(hosts).to.include('http://127.0.0.2');
        done();
      });
  });
});

describe('hipache.add', function () {

  it('catch without frontend', function (done) {
    hipache.add()
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('catch without backend', function (done) {
    hipache.add('frontend.com')
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('catch frontend is not string', function (done) {
    hipache.add([], 'backend')
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('catch backend is not string', function (done) {
    hipache.add('frontend', [])
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('Add one backend', function (done) {
    hipache.add('frontend', '127.0.0.1')
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(1);
        return hipache.find('frontend');
      }).then(function (ips) {
        demand(ips).to.be.an.array();
        demand(ips).length(1);
        demand(ips).to.include('http://127.0.0.1');
        done();
      });
  });

  it('Add two backends', function (done) {
    hipache.add('frontend', '127.0.0.1', '127.0.0.2')
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(2);
        return hipache.find('frontend');
      }).then(function (ips) {
        demand(ips).to.be.an.array();
        demand(ips).length(2);
        demand(ips).to.include('http://127.0.0.1');
        demand(ips).to.include('http://127.0.0.2');
        done();
      });
  });

  it('Add backend twice', function (done) {
    hipache
      .add('frontend', '127.0.0.1')
      .then(function (backends) {
        demand(backends).to.be.an.array();
        demand(backends).length(1);
        return hipache.add('frontend', '127.0.0.1');
      })
      .then(function (backends) {
        demand(backends).to.be.an.array();
        demand(backends).length(1);
        demand(backends).to.include('http://127.0.0.1');
        return hipache.find('frontend');
      })
      .then(function (backends) {
        demand(backends).to.be.an.array();
        demand(backends).length(1);
        demand(backends).to.include('http://127.0.0.1');
        done();
      });
  });

  it('Add three backends and repeat one', function (done) {
    hipache
      .add('frontend', '127.0.0.1', '127.0.0.2', '127.0.0.1')
      .then(function (backends) {
        demand(backends).to.be.an.array();
        demand(backends).length(2);
        return hipache.find('frontend');
      })
      .then(function (backends) {
        demand(backends).to.be.an.array();
        demand(backends).length(2);
        demand(backends).to.include('http://127.0.0.1');
        demand(backends).to.include('http://127.0.0.2');
        done();
      });
  });
});

describe('hipache.rename', function () {
  it('catch without frontend', function (done) {
    hipache.rename()
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('catch without new frontend', function (done) {
    hipache.rename('frontend.com')
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('catch frontend don\'t exist', function (done) {
    hipache
      .rename('currenthostname.com', 'newhostname.com')
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('frontend exist', function (done) {
    hipache.add('currenthostname.com', 'http://127.0.0.1')
      .then(function () {
        return hipache.rename('currenthostname.com', 'newhostname.com');
      })
      .then(function (ok) {
        demand(ok).to.be.equal(hipache.frontendPrefix + 'newhostname.com');
        return hipache.find('newhostname.com');
      })
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(1);
        demand(hosts).to.include('http://127.0.0.1');
        return hipache.find('currenthostname.com');
      })
      .then(function (hosts) {
        demand(hosts).to.be.a.null();
        done();
      });
  });
});

describe('hipache.remove', function () {
  var frontend = 'hostname.com';

  it('catch without frontend', function (done) {
    hipache.remove()
      .catch(function (err) {
        demand(err).to.be.a(Error);
        return err;
      })
      .then(function (err) {
        demand(err).to.be.a(Error);
        done();
      });
  });

  it('returns the frontend even when there is', function (done) {
    hipache.add(frontend, '127.0.0.1')
      .then(function () {
        return hipache.remove(frontend);
      })
      .then(function (returned) {
        demand(returned).to.be.equal(frontend);
        done();
      });
  });

  it('remove frontend', function (done) {
    hipache
      .add(frontend, '127.0.0.1', '127.0.0.2', '127.0.0.3')
      .then(function () {
        return hipache.remove(frontend);
      })
      .then(function (removed) {
        demand(removed).to.be.an.string();
        demand(removed).to.be.equal(frontend);
        return hipache.find(frontend);
      })
      .then(function (found) {
        demand(found).to.be.a.null();
        done();
      });
  });

  it('catch without frontend', function (done) {
    hipache.add(frontend, '127.0.0.1', '127.0.0.2', '127.0.0.3')
      .then(function () {
        return hipache.remove(frontend, '127.0.0.1', '127.0.0.2', '127.0.0.5');
      })
      .then(function (removed) {
        demand(removed).to.be.an.array();
        demand(removed).length(2);
        demand(removed).to.include('127.0.0.1');
        demand(removed).to.include('127.0.0.2');
        return hipache.find(frontend);
      })
      .then(function (removed) {
        demand(removed).to.be.an.array();
        demand(removed).length(1);
        demand(removed).to.include('http://127.0.0.3');
        done();
      });
  });

});
