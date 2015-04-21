var HipacheCtl = require('../lib');
var demand = require('must');

describe('HipacheCtl', function () {
    var hipache = new HipacheCtl();

    it('should exist', function () {
        demand(HipacheCtl).to.exist();
    });

    it('parse normal ip', function () {
        demand(hipache.formatUrl('127.0.0.1')).to.equal('http://127.0.0.1');
    });

    it('parse ip with port 443', function () {
        demand(hipache.formatUrl('127.0.0.1:443')).to.equal('https://127.0.0.1');
    });

    it('parse ip with port 3000', function () {
        demand(hipache.formatUrl('127.0.0.1:3000')).to.equal('http://127.0.0.1:3000');
    });

    it('parse ip with port 3000 and ssl', function () {
        demand(hipache.formatUrl('https://127.0.0.1:3000')).to.equal('https://127.0.0.1:3000');
    });
});
