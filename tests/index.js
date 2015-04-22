var HipacheCtl = require('../lib'),
  demand = require('must'),
  Promisse = require('bluebird'),
  redis = require("redis");

describe('HipacheCtl', function () {
  var client, hipache;
  beforeEach(function (done) {
    client = redis.createClient(6379, '192.168.99.107');
    client.flushall(function () {
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
        hipache.find('hipachectl.com', '127.0.0.1', '').then(function (hosts) {
          demand(hosts).to.be.an.array();
          demand(hosts).length(1);
          demand(hosts).to.include('http://127.0.0.1');
          done();
        });
      });
  });

  it('hipache.push', function (done) {
    hipache.push('hipachectl.com', '127.0.0.1').then(function (hosts) {
      demand(hosts).to.be.an.array();
      demand(hosts).length(1);
      hipache.find('hipachectl.com').then(function (ips) {
        demand(ips).to.be.an.array();
        demand(ips).length(1);
        demand(ips).to.include('http://127.0.0.1');
        done();
      });
    });
  });
});
