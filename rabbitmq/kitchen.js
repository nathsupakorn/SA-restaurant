#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: kitchen.js food beverage");
  process.exit(1);
}

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'direct_logs';

    channel.assertExchange(queue, 'direct', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);

      args.forEach(function(category) {
        channel.bindQueue(q.queue, queue, category);
      });

      channel.consume(q.queue, function(msg) {
        console.log(" [X] Received '%s'", msg.fields.routingKey)
        console.log(JSON.parse(msg.content.toString()))
      }, {
        noAck: false
      });
    });
  });
});