# amqp-delay.node
[![NPM version][npm-image]][npm-url]

Publish messages to RabbitMQ immediately, but queue consumers will only receive these messages after a certain delay. The AMQP protocol does not support this directly, but RabbitMQ's AMQP [Dead-Letter Exchanges](https://www.rabbitmq.com/dlx.html) extension we can easily achieve this functionality.

Inspired by [node-amqp-schedule](https://github.com/purposeindustries/node-amqp-schedule), but built for [amqplib](https://github.com/squaremo/amqp.node).

## Install
```sh
$ npm install amqp-delay.node --save
```

## Usage
```javascript
var amqp = require('amqplib');

amqp.connect().then(function(conn) {
  return conn.createChannel().then(function (channel) {
    require('amqp-delay.node')(channel);
    return channel.delay(3000).publish('foo', 'bar', new Buffer('hello world'));
  });
}).then(null, console.warn);
```

[npm-image]: https://img.shields.io/npm/v/amqp-delay.node.svg?style=flat
[npm-url]: https://npmjs.org/package/amqp-delay.node
