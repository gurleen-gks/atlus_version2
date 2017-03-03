var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');

var router = express.Router();
var api = require('./REST.js');
api = new api(router);
api.handleRoutes();

var app = express();

// for login
var pg = require('pg');
var cookieParser        = require('cookie-parser') ;
var conString = "postgres://Fon:password@localhost:5432/test";
var session = require('express-session');

app.use(session({
cookie: {maxAge: 60 * 1000 * 30} ,
resave: true, // don't save session if unmodified
saveUninitialized: false, // don't create session until something stored
secret: 'ssaszhuoliangzhang'
}));

///////////////////////
// Server Middleware
///////////////////////

app.use(logger(app.get("env") === "production" ? "combined" : "dev"));

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// CORS
// This allows client applications from other domains use the API Server
/*app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});*/


//////////////////
// API Queries
//////////////////

app.use('/', router);

// }) ;
//////////////////
// Server Setup
//////////////////

app.set("env", process.env.NODE_ENV || "development");
app.set("host", process.env.HOST || "0.0.0.0");
app.set("port", process.env.PORT || 52017);
// app.all('*', function(req, res, next) {  
//     res.header("Access-Control-Allow-Origin", "*");  
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
//     res.header("X-Powered-By",' 3.2.1')  
//     res.header("Content-Type", "application/json;charset=utf-8");  
//     next();  
// });
app.listen(app.get("port"), function () {
    console.log('\n' + '**********************************');
    console.log('REST API listening on port ' + app.get("port"));
    console.log('**********************************' + '\n');
});


////////////////////
// Error Handlers
////////////////////

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
		console.log(err.stack);
        res.status( err.code || 500 )
        .json({
            status: 'error',
            message: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    .json({
        status: 'error',
        message: err.message
    });
});


//login & logout &register



module.exports = app;