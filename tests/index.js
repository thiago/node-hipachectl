var HipacheCtl = require('../lib'),
  url = require('url'),
  demand = require('must'),
  redis = require("redis"),
  REDIS_URL = url.parse(process.env.REDIS_PORT_6379 || process.env.REDIS_URL || 'tcp://redis:6379'),
  REDIS_HOSTNAME = REDIS_URL.hostname,
  REDIS_PORT = REDIS_URL.port;


describe('HipacheCtl', function () {
  var client, hipache;

  before(function(){
    client = redis.createClient(REDIS_PORT, REDIS_HOSTNAME);
  });

  beforeEach(function (done) {
    client.flushdb(function () {
      done();
    });
  });

  after(function () {
    client.quit();
  });

  it('Instance not exist without client', function () {
    demand(HipacheCtl).must.throw();
  });

  it('Instance exist with client', function () {
    hipache = new HipacheCtl(client);
    demand(hipache).length(0);
  });

  it('hipache.formatHost', function () {
    demand(hipache.formatHost()).to.equal(null);
    demand(hipache.formatHost('www.mysite.com')).to.equal(hipache.hostnamePrefix + 'www.mysite.com');
  });

  it('hipache.formatUrl', function () {
    demand(hipache.formatUrl()).to.equal(null);
    demand(hipache.formatUrl('127.0.0.1')).to.equal('http://127.0.0.1');
    demand(hipache.formatUrl('127.0.0.1:443')).to.equal('https://127.0.0.1');
    demand(hipache.formatUrl('127.0.0.1:3000')).to.equal('http://127.0.0.1:3000');
    demand(hipache.formatUrl('https://127.0.0.1:3000')).to.equal('https://127.0.0.1:3000');
  });

  it('hipache.find', function (done) {
    hipache.client.rpushAsync('frontend:hipachectl.com', 'http://127.0.0.1')
      .then(function () {
        return hipache.find('hipachectl.com', '127.0.0.1', '');
      }).then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(1);
        demand(hosts).to.include('http://127.0.0.1');
        done();
      });
  });

  it('hipache.rename', function (done) {
    hipache.rename('currenthostname.com').catch(function (err) {
      demand(err).to.be.a(Error);
    }).then(function () {
      return hipache.client.rpushAsync('frontend:currenthostname.com', 'http://127.0.0.1');
    }).then(function () {
      return hipache.rename('currenthostname.com', 'newhostname.com');
    }).then(function () {
      return hipache.find('newhostname.com', '127.0.0.1', '');
    }).then(function (hosts) {
      demand(hosts).to.be.an.array();
      demand(hosts).length(1);
      demand(hosts).to.include('http://127.0.0.1');
      done();
    });
  });

  it('hipache.add', function (done) {
    hipache.add('hipachectl.com', '127.0.0.1')
      .then(function (hosts) {
        demand(hosts).to.be.an.array();
        demand(hosts).length(1);
        return hipache.find('hipachectl.com');
      }).then(function (ips) {
        demand(ips).to.be.an.array();
        demand(ips).length(1);
        demand(ips).to.include('http://127.0.0.1');
        done();
      });
  });

  it('hipache.remove', function (done) {
    var host = 'hostname.com';
    hipache.add(host, '127.0.0.1', 'mysite', 'mysite', 'mysite')
      .then(function () {
        return hipache.remove(host, 'mysite', '127.0.0.1', 'notexist');
      }).then(function (removed) {
        demand(removed).to.be.an.array();
        demand(removed).length(3);
        demand(removed).to.include(0);
        demand(removed).to.include(1);
        return hipache.remove(host);
      }).then(function (removed) {
        demand(removed).to.be.an.number();
        demand(removed).to.be.equal(0);
        done();
      });
  });

});
