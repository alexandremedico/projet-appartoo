"use strict";

// Module
const express = require('express');
const http = require('http');
// const striptags = require('striptags');
const path = require('path');
const bodyParser = require('body-parser');
const socketio = require('socket.io');

// Constantes
const app = express();
const server = http.Server(app);
const io = socketio(server);
const PORT = process.env.PORT || 8080;

// Mongodb
var MongoClient = require('mongodb').MongoClient;
const session = require('express-session');
const connectMongo = require('connect-mongo');
const dbName = 'pangolin';
const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);
const MongoStore = connectMongo(session);
const options = {
    store: new MongoStore({
        url: "mongodb://127.0.0.1:27017"
    }),
    secret: "blablabla",
    saveUninitialized: true,
    resave: true
}

// Middlewares
app.use('/', express.static(path.join(__dirname, '/dist/pangolin-friends')));
app.use(session(options));
app.use(bodyParser.json());

// Routes
app.all('*', (req, res) => { 
    res.sendFile(path.join(__dirname, '/dist/index.html'));
})

let boxlog = '';
let boxpassword = '';
let valueAge = '';
let name = "";
let boxloginsc = '';
let boxage = '';
let boxfamily = '';
let boxrace = '';
let boxfood = '';
let boxpasswordinsc = '';
let donnees = '';
io.on('connection', (socket) => {
    // console.log('socket open');

    // log
    socket.on('valueLogAndPassword', function (boxlog, boxpassword) {
        boxlog = boxlog;
        boxpassword = boxpassword;

        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
            let db = client.db(dbName);
            let collection = db.collection(boxlog);
            collection.find().toArray(function (err, data) {
                donnees = data;
                
                if (data[0].log == boxlog && data[0].password == boxpassword) {
                    socket.emit('valueResult', data);
                    client.close();
                } else {
                    socket.emit('valueWrong');
                    client.close();
                }
            });
        })
    })

    // edit age
    socket.on('valueAge', function (valueAge, name) {
        valueAge = valueAge;
        name = name;
        
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {

            let db = client.db(dbName);
            let collection = db.collection(name);
            let myquery = { $set : { age: valueAge }};
            let oldValue = { log : donnees[0].log };
            
            collection.updateOne(oldValue, myquery, function () {
                collection.find().toArray(function (err, data) {
                    console.log(data);
                    client.close();
                })
            });
        })
    })

    // edit family
    socket.on('valueFamily', function (valueFamily, name) {
        valueFamily = valueFamily;
        name = name;
        
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {

            let db = client.db(dbName);
            let collection = db.collection(name);
            let myquery = { $set : { family: valueFamily}};
            let oldValue = { log : donnees[0].log };
            
            collection.updateOne(oldValue, myquery, function () {
                collection.find().toArray(function (err, data) {
                    console.log(data);
                    client.close();
                })
            });
        })
    })
    
    // edit race
    socket.on('valueRace', function (valueRace, name) {
        valueRace = valueRace;
        name = name;
        
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {

            let db = client.db(dbName);
            let collection = db.collection(name);
            let myquery = { $set : { race: valueRace}};
            let oldValue = { log : donnees[0].log };
            
            collection.updateOne(oldValue, myquery, function () {
                collection.find().toArray(function (err, data) {
                    console.log(data);
                    client.close();
                })
            });
        })
    })

    // edit food
    socket.on('valueFood', function (valueFood, name) {
        valueFood = valueFood;
        name = name;
        
        MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {

            let db = client.db(dbName);
            let collection = db.collection(name);
            let myquery = { $set : { food: valueFood}};
            let oldValue = { log : donnees[0].log };
            
            collection.updateOne(oldValue, myquery, function () {
                collection.find().toArray(function (err, data) {
                    console.log(data);
                    client.close();
                })
            });
        })
    })

    // inscription
    socket.on('inscription', function (boxloginsc, boxage, boxfamily, boxrace, boxfood, boxpasswordinsc) {
        boxloginsc = boxloginsc;
        boxage = boxage;
        boxfamily = boxfamily;
        boxrace = boxrace;
        boxfood = boxfood;
        boxpasswordinsc = boxpasswordinsc;

        if (boxloginsc == '' || boxage == '' || boxfamily == '' || boxrace == '' || boxfood == '' || boxpasswordinsc == '' ) {
            socket.emit('inscriptionWrong');
            client.close();
        } else {
            MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
                let db = client.db(dbName);
                let collection = db.collection(boxloginsc);
                let insertion = {};

                insertion.log = boxloginsc;
                insertion.password = boxpasswordinsc;
                insertion.age = boxage;
                insertion.family = boxfamily;
                insertion.race = boxrace;
                insertion.food = boxfood;

                collection.insertOne(insertion, function () {
                    collection.find().toArray(function (err, data) {
                        socket.emit('inscriptionValid', data);
                        client.close();
                })
            })})
        }
    })

    // search
    socket.on('valueSearch', function (boxSearch) {
        if (boxSearch == '') {
            socket.emit('emptySearch');
            client.close();
        } else {
            MongoClient.connect(url, { useUnifiedTopology: true }, function (err, client) {
                let db = client.db(dbName);
                let collection = db.collection(boxSearch);
    
                collection.find().toArray(function (err, data) {
                    if (data == '') {
                        socket.emit('wrongSearch');
                        client.close();
                    } else {
                        socket.emit('resultSearch', data);
                        console.log(data)
                        client.close();
                    }
                })
            })
        }
    })
})

server.listen(PORT, ()=> console.log(`listening on ${PORT}`));
