// const client = require("./client");

const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

var amqp = require('amqplib/callback_api')

app.post("/placeorder", (req, res) => {
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

            var queue = 'order_queue';

            channel.assertQueue(queue, {
                durable: true
            })

            channel.sendToQueue(queue, Buffer.from(JSON.stringify(orderItem)), {
                persistent: true
            })
            console.log(" [X] Sent '%s", orderItem)
        })
    })
})

const PORT = 4000;
app.listen(PORT,()=>{
    console.log("Server running at port %d",PORT);
});