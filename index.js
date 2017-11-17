module.exports = function delayer(channel, opts) {
  opts = opts || {};
  opts.separator = opts.separator || '.';
  opts.prefix = opts.prefix || 'delay';
  opts.threshold = opts.threshold || 10000;
  opts.round = opts.round || 1000;

  channel.delay = function (delayMs) {
    return {
      publish: function (exchange, routingKey, content, options, cb) {
        delayMs = Math.ceil(delayMs / opts.round) * opts.round;

        let ttl = delayMs;
        let time = { ms: 1000, s: 60, m: 60, h: 24, d: 30, mo: 12, y: 999999 };

        delayMs = Object.keys(time).map(function(unit) {
          let mod = delayMs % time[unit];
          delayMs = Math.floor(delayMs / time[unit]);
          if (!mod) {
            return '';
          }
          return mod + unit;
        }).reverse().join('');

        let name = [opts.prefix, exchange, delayMs].join(opts.separator);

        return channel.assertExchange(name, 'fanout', {
          durable: true,
          autoDelete: true
        }).then(() => {
          return channel.assertQueue(name, {
            durable: true,
            autoDelete: true,
            arguments: {
              'x-dead-letter-exchange': exchange,
              'x-message-ttl': ttl,
              'x-expires': ttl + opts.threshold
            }
          });
        }).then(() => {
          return channel.bindQueue(name, name, '#');
        }).then(() => {
          return channel.publish(name, routingKey, content, options, cb);
        });
      }
    };
  };
};
