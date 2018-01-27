# weather-app

## endpoints:

GET  api.markl.fi                               
// get temperature data from all stations only for last 24h.

POST api.markl.fi                               
// post new temperature data { city: 'city', value: 'temperature' }

GET  api.markl.fi/:city                         
// get all temperature data of that one city

GET  api.markl.fi/weatherdata/:city             
// get openweathermap's data of that city
