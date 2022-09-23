require('dotenv').config({path:'./config.env'})
const Menu = require('../models/Menu')

const PROTO_PATH="./restaurant.proto";

var grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

var restaurantProto =grpc.loadPackageDefinition(packageDefinition);

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

const {v4: uuidv4}=require("uuid");

const server = new grpc.Server();

server.addService(restaurantProto.RestaurantService.service,{
    getAllMenu: async (_,callback)=>{
        const menu = await Menu.find()
        callback(null, {menu});
    },
    get: async (call,callback)=>{
        const menu = await Menu.findById(call.request.id)

        if(menu) {
            callback(null, menu);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
    },
    orderFood: async (call, callback) => {
        const order = {
            id: call.request.id,
            name: call.request.name,
            quantity: call.request.quantity,
            category: call.request.category
        }

        try {

        } catch (error) {
            console.log(error)
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
    },
    insert: async (call, callback)=>{

        const menu = new Menu({
            id: uuidv4(),
            name: call.request.name,
            price: call.request.price,
            category: call.request.category
        })
        try {
            const newMenu = await menu.save()
            callback(null,newMenu);
        } catch (err) {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not found"
            });
        }
        
    },
    update: async (call,callback)=>{
        const menu = await Menu.findById(call.request.id)

        if(menu){
            menu.name=call.request.name;
            menu.price=call.request.price;
            menu.category=call.request.category;
            await menu.save()
            callback(null,menu);
        } else {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
    },
    remove: async (call, callback) => {
        let menu = await Menu.findById(call.request.id);

        try {
            await menu.remove()
            callback(null, {})
        } catch (err) {
            callback({
                code: grpc.status.NOT_FOUND,
                details: "NOT Found"
            });
        }
    }
});



server.bind("127.0.0.1:30043",grpc.ServerCredentials.createInsecure());
console.log("Server running at http://127.0.0.1:30043");
server.start();