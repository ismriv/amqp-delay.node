module.exports = function delayer(channel, opts) {
  opts = opts || {};
  opts.separator = opts.separator || '.';
  opts.prefix = opts.prefix || 'delay';
  opts.threshold = opts.threshold || 10000;
  opts.round = opts.round || 1000;

  channel.delay = function (delayMs) {
    return {
      publish: function (exchange, routingKey, content, options) {
        delayMs = Math.ceil(delayMs / opts.round) * opts.round;

        var ttl = delayMs;
        var time = { ms: 1000, s: 60, m: 60, h: 24, d: 30, mo: 12, y: 999999 };

        delayMs = Object.keys(time).map(function(unit) {
          var mod = delayMs % time[unit];
          delayMs = Math.floor(delayMs / time[unit]);
          if (!mod) {
            return '';
          }
          return mod + unit;
        }).reverse().join('');

        var name = [opts.prefix, exchange, delayMs].join(opts.separator);

        return channel.assertExchange(name, 'fanout', {
          durable: true,
          autoDelete: true
        }).then(function () {
          return channel.assertQueue(name, {
            durable: true,
            autoDelete: true,
            arguments: {
              'x-dead-letter-exchange': exchange,
              'x-message-ttl': ttl,
              'x-expires': ttl + opts.threshold
            }
          });
        }).then(function () {
          return channel.bindQueue(name, name, '#');
        }).then(function () {
          return channel.publish(name, routingKey, content, options);
        });
      }
    };
  };
};
