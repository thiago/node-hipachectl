# hipachectl [![Build Status](https://secure.travis-ci.org/trsouz/node-hipachectl.png?branch=master)](https://travis-ci.org/trsouz/node-hipachectl)

hipache

## Install

    npm install --save hipachectl

## Usage

    var redis = require("redis"),
        client = redis.createClient(),
        hipache = new require("hipachectl")(client);
    
    hipache.add("myvhost.com.br", "127.0.0.1:3000").then(function(){
        console.log('Added');
    });
    
## API

### add(vhost, address, [address, ...])
### find(vhost, [address, ...])
### remove(vhost, [address, ...])
### rename(vhost, newVHost)
### formatHost(vhost)
### formatUrl(address)

## License

MIT
