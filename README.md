<a href="https://promisesaplus.com/"><img src="https://promisesaplus.com/assets/logo-small.png" align="right" /></a>
# hipachectl

[![travis][travis-image]][travis-url]
[![dep][dep-image]][dep-url]
[![npm][npm-image]][npm-url]
[![downloads][downloads-image]][downloads-url]

[travis-image]: https://img.shields.io/travis/trsouz/node-hipachectl.svg?style=flat
[travis-url]: https://travis-ci.org/trsouz/node-hipachectl
[dep-image]: https://david-dm.org/trsouz/node-hipachectl.png
[dep-url]: https://david-dm.org/trsouz/node-hipachectl
[npm-image]: https://img.shields.io/npm/v/hipachectl.svg?style=flat
[npm-url]: https://npmjs.org/package/hipachectl
[downloads-image]: https://img.shields.io/npm/dm/hipachectl.svg?style=flat
[downloads-url]: https://npmjs.org/package/hipachectl

## What Is It?

This is a simple module for interact with redis for [hipache](https://github.com/hipache/hipache) writen in nodejs. It can be used in nodejs or command-line.

It was inspired in [prologic/hipachectl](https://github.com/prologic/hipachectl) writen in python.

## Install

    npm install --save hipachectl

## Usage

All methods return a [promisse](https://github.com/petkaantonov/bluebird) and uses a client of [redis nodejs](https://github.com/mranney/node_redis) to configure the redis connection.

    var redis = require('redis'),
        client = redis.createClient(),
        hipache = new require('hipachectl')(client);
    
    hipache.add('myfrontend.com', '127.0.0.1:3000').then(function(){
        console.log('Added');
    });
    
## API

### add(frontend, backend, [backend, ...])
### find(frontend, [backend, ...])
### remove(frontend, [backend, ...])
### rename(frontend, newFrontend)
### formatFrontend(frontend)
### formatBackend(backend)

    
## Command line
    
    $ hipachectl add myfrontend.com 127.0.0.1:3000

### Help command line
    
    Usage: hipachectl [options] [command]
    
    
    Commands:
    
      find <frontend> [backend...]     Find a frontend or a backends inside a frontend
      add <frontend> <backend...>      Creates the frontend and associates a backends
      remove <frontend> [backend...]   Remove the frontend or a backends inside a frontend
      rename <frontend> <newFrontend>  Rename a frontend
      formatBackend <backend>          Format backend
      formatFrontend <frontend>        Format frontend
    
    Options:
    
      -h, --help             output usage information
      -V, --version          output the version number
      -u, --url <url>        Redis URL for Hipache (default: 127.0.0.1:6379)
      -s, --socket <socket>  Redis socket for Hipache (overrides url)

## License

MIT
