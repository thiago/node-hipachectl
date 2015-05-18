#!/usr/bin/env node
/*jshint -W079 */

var REDIS_PORT, REDIS_HOSTNAME, client, hipache, currentCmd,
  _ = require('underscore'),
  parse = require('url-parse'),
  redis = require('redis'),
  Hipache = require('..'),
  Promisse = require('bluebird'),
  program = require('commander'),
  pack = require('./../package.json'),
  REDIS_URL = process.env.REDIS_PORT_6379 || process.env.REDIS_URL || '127.0.0.1:6379',
  REDIS_SOCKET = process.env.REDIS_SOCKET || null,
  returnFlag = '-->',
  cmds = {
    'find': {
      args: '<frontend> [backend...]',
      desc: 'Find a frontend or a backends inside a frontend',
      examples: [
        'www.mysite.com',
        'www.mysite.com 192.168.0.42'
      ]
    },
    'add': {
      args: '<frontend> <backend...>',
      desc: 'Creates the frontend and associates a backends',
      examples: [
        'www.mysite.com 127.0.0.1:8080',
        'www.mysite.com 192.168.0.42 192.168.0.43:8000'
      ]
    },
    'remove': {
      args: '<frontend> [backend...]',
      desc: 'Remove the frontend or a backends inside a frontend',
      examples: [
        'www.mysite.com',
        'www.mysite.com 192.168.0.42'
      ]
    },
    'rename': {
      args: '<frontend> <newFrontend>',
      desc: 'Rename a frontend',
      examples: [
        'www.mysite.com www.newsite.com'
      ]
    },
    'formatBackend': {
      args: '<backend>',
      desc: 'Format backend',
      examples: [
        'www.mysite.com'
      ]
    },
    'formatFrontend': {
      args: '<frontend>',
      desc: 'Format frontend',
      examples: [
        'www.mysite.com'
      ]
    }
  };

program
  .version(pack.version)
  .option('-u, --url <url>', 'Redis URL for Hipache (default: 127.0.0.1:6379)', REDIS_URL)
  .option('-s, --socket <socket>', 'Redis socket for Hipache (overrides url)', REDIS_SOCKET);

_.each(cmds, function (args, cmd) {
  program
    .command(cmd + ' ' + args.args)
    .description(args.desc)
    .action(function () {
      currentCmd = cmd;
    })
    .on('--help', function () {
      console.log('  Examples:');
      console.log();
      args.examples.forEach(function (example) {
        if (example.indexOf(returnFlag) === 0) {
          console.log(['     ', example].join(' '));
        } else {
          console.log(['    $', program.name(), cmd, example].join(' '));
        }
      });
      console.log();
    });
});

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}


REDIS_URL = parse(program.url);
REDIS_PORT = REDIS_URL.port;
REDIS_HOSTNAME = REDIS_URL.hostname;
client = program.socket ? redis.createClient(program.socket) : redis.createClient(REDIS_PORT, REDIS_HOSTNAME);
hipache = new Hipache(client);
Promisse.promisifyAll(hipache);

var arg = [program.args[0]];
var args = program.args[1];

if (_.isString(args)) {
  arg = arg.concat([args]);
} else if (_.isArray(args)) {
  arg = arg.concat(args);
}

hipache[currentCmd]
  .apply(hipache, arg)
  .then(function (log) {
    if (_.isArray(log)) {
      log.forEach(function (v) {
        console.log(v);
      });
    } else if (log !== null && log !== undefined){
      console.log(log);
    }
  })
  .catch(function (err) {
    console.error(err.message);
  })
  .finally(function () {
    client.quit();
  });
