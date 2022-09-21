#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var queue = 'food';

    channel.assertExchange(queue, 'fanout', {
      durable: false
    });

    channel.assertQueue('', {
      exclusive: true
    }, function(error2, q) {
      if (error2) {
        throw error2;
      }
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      channel.bindQueue(q.queue, queue, '');

      channel.consume(q.queue, function(msg) {
        var secs = msg.content.toString().split('.').length - 1;
        console.log(" [X] Received")
        console.log(JSON.parse(msg.content))
      }, {
        noAck: false
      });
    });
  });
});