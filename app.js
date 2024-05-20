var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors')
const helmet = require("helmet");

/** Mongo INIT */
const db = require('./models')
db.mongoose.connect(db.url, {useNewUrlParser:true})
.then(()=>console.log("Database is connected!"))
.catch((err)=>{console.log("Unable to connect into database!", err);process.exit()})
/** Mongo INIT */

var app = express();

app.use(cors());
app.use(cors({credentials: true, origin: true}));
// app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/v1/', express.static(path.join(__dirname, 'public')));

/** PUBLIC */

/** Web */
const MiddlewareAuth = require('./middleware/MiddlewareAuth');
const index = require('./routes/web')
app.use('/api/v1/', MiddlewareAuth, index)

/** Mobile */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  return res.status(404).json({
    success: false,
    msg: "Request not found"
  })
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
