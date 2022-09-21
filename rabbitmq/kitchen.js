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
        var queue = 'order_queue'

        channel.assertQueue(queue, {
            durable: true
        })

        channel.prefetch(1);
        console.log(" [*] Waiting for message in %s. To exit press CTRL+C", queue)
        channel.consume(queue, function(msg) {
            var secs = msg.content.toString().split('.').length - 1;
            console.log(" [X] Received")
            console.log(JSON.parse(msg.content))

            setTimeout(function() {
                console.log(" [X] Done")
                channel.ack(msg)
            }, secs * 1000)
        }, {
            noAck: false
        })
    })
})