const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
var amqp = require('amqplib/callback_api')

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


app.post("/placeorder", (req, res) => {
    var queue = req.body.category || ''

    var orderItem = {
        id: req.body.id,
        name: req.body.name,
        quantity: req.body.quantity
    };

    amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            channel.assertExchange(queue, 'fanout', {
                durable: false
            });
            
            console.log('category', queue)
            channel.publish(queue, '', Buffer.from(JSON.stringify(orderItem)), {
                persistent: true
            })
            // channel.assertQueue(queue, {
            //     durable: true
            // })

            // channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderItem)), {
            //     persistent: true
            // })
            console.log(" [X] Sent '%s", orderItem)
        })
    })
})

const PORT = 4000;
app.listen(PORT,()=>{
    console.log("Server running at port %d",PORT);
});