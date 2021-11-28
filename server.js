const express = require('express')
const swaggerUI = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json')
var bodyParser = require('body-parser')
const fs = require("fs")
const gpio = require('onoff').Gpio;
const cors = require('cors');

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
//pi@192.168.178.48, pi, raspberry, 22

app.get('/getLeds', function (req, res){
    fs.readFile( __dirname + "/" + "leds.json", 'utf8', function (err, data) {
        var leds = JSON.parse(data)
        console.log(leds)
        res.json(leds)
     });
}) 

app.get('/getLed/:id', function (req, res){
    var ledID = Number(req.params.id)
    fs.readFile( __dirname + "/" + "leds.json", 'utf8', function (err, data) {
        var leds = JSON.parse(data)
        var led = leds.filter(led => led.id == ledID)
        console.log(led)
        res.json(led)
    })
})

app.put('/updateLed', function (req, res) {
    var ledID = Number(req.body.id)
    var ledState = Number(req.body.state)
    //TODO schreiben/lesen sperren
    fs.readFile( __dirname + "/" + "leds.json", 'utf8', function (err, data) {
        var leds = JSON.parse(data)
        var led = leds.filter(led => led.id == ledID)
        if(led.length == 1) {
            console.log(led[0])
            led[0].state = ledState
            console.log(" -> ")
            console.log(led[0])
        } else {
            console.log('Led not found')
        }
        fs.writeFileSync( __dirname + "/" + "leds.json", JSON.stringify(leds));
    })
    var LED = new gpio(ledID, 'out')
    LED.writeSync(ledState);
    res.end();
})

app.post('/addLed', function (req, res) {
    var ledID = Number(req.body.id)
    var ledState = Number(req.body.state)
    fs.readFile( __dirname + "/" + "leds.json", 'utf8', function (err, data) {
        console.log(data)
        var leds = JSON.parse(data)
        var led = leds.filter(led => led.id == ledID)
        if (led.length == 0) {
            leds.push({id: ledID, state: ledState})
            fs.writeFileSync( __dirname + "/" + "leds.json", JSON.stringify(leds));
        }
        console.log(leds)
    })
    res.end();
})

app.delete('/deleteLed', function (req, res) {
    var ledID = Number(req.body.id)
    fs.readFile( __dirname + "/" + "leds.json", 'utf8', function (err, data) {
        var leds = JSON.parse(data)
        var updatedLeds = leds.filter(led => led.id != ledID)
        fs.writeFileSync( __dirname + "/" + "leds.json", JSON.stringify(updatedLeds));
    })
    res.end();
})

app.listen(3000, () =>{
    console.log('Server listening on port 3000')
})