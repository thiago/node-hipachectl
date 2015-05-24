var redis = require('redis'),
  url = require('url'),
  REDIS_URL = url.parse(process.env.REDIS_PORT_6379_TCP || process.env.REDIS_URL || 'tcp://redis:6379'),
  REDIS_HOSTNAME = REDIS_URL.hostname,
  REDIS_PORT = REDIS_URL.port,
  client = redis.createClient(REDIS_PORT, REDIS_HOSTNAME),
  hipache = new (require('../lib/index'))(client);

hipache
  .add('myfrontend.com', '127.0.0.1:3000')
  .then(function (added) {
    console.log('Added', added);
    // --> Added [ 'http://127.0.0.1:3000' ]
    return hipache.find('myfrontend.com');
  })
  .then(function (backends) {
    console.log('Backends', backends);
    // --> Backends [ 'myfrontend.com', 'http://127.0.0.1:3000' ]
  });
