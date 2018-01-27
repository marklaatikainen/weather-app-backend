const bodyParser = require('body-parser')
var express = require('express')
const request = require('request')
var app = express()
var cors = require('cors')

const apiKey = ''

var mongoose = require('mongoose')
mongoose.connect('mongodb://<user>:<password>@<host>/weatherapp')
var db = mongoose.connection
var Schema = mongoose.Schema
var DataSchema = new Schema({
    city: String,
    location: String,
    temp_data: []
})
var Data = mongoose.model("Temperatures", DataSchema)

app.use(cors())
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(bodyParser.json())

app.get('/', (req, res) => {
    var obj = []
    Data.find({}, (err, temperatures) => {
        if (err) {
            res.send("Error!")
            next()
        }
        obj.push(returnTempData(temperatures))
        res.json(obj)
    })
})

function getIcon(data) {
    let city = (data.city == 'Tokio') ? 'Tokyo' : data.city

    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`

    request(url, function (err, response, body) {
        if (err) {
            return ''
        } else {
            let weather = JSON.parse(body)
            if (weather.main == undefined) {
                return ''
            } else {
                return weather.weather[0].icon
            }
        }
    })
}


app.get('/:city', (req, res) => {
    Data.find({ city: req.params.city }, {}, (err, temperatures) => {
        if (err) {
            res.send("Error!")
            next()
        }
        res.json(temperatures)
    })
})

app.post('/', (req, res) => {
    var tempData = { value: req.body.temperature, timestamp: new Date() }
    Data.findOneAndUpdate({ city: req.body.station }, { $push: { temp_data: tempData } }, () => {
        res.status(200).send()
    })
})

function returnTempData(json) {
    var obj = []
    json.forEach(function (value, i) {
        var temp_data = []
        value.temp_data.forEach(function (item, l) {
            if (less_than_day(item.timestamp)) {
                temp_data.push(item)
            }
        })
        obj.push({
            city: value.city,
            location: value.location,
            icon: getIcon(value.city),
            temp_data: temp_data
        })
    })
    return obj
}

function less_than_day(temp_data) {
    var day = (1000 * 60 * 60) * 24
    var date = new Date(temp_data).getTime()
    if (date > (new Date().getTime() - day)) {
        return true
    }
    return false
}


const port = process.env.PORT ? process.env.PORT : 3000
const server = app.listen(port, () => {
    console.log("Server listening  port %s", port)
})
