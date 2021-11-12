const express = require('express');
const userRoute = require('./route/user');
const OperationalError = require('./utility/operationalError');
const globalErrorHandler = require('./controller/errorHandler/globalErrorHandler');

const app = express();

// Make body parser available
app.use(express.json());

// Register all routes
app.use('/api/v1/users',userRoute);


// handle all Unregister routes
app.all('*',(req,res,next)=>{
    next(new OperationalError(`${req.originalUrl} is not a valid route`,440));
});

app.use(globalErrorHandler);

module.exports = app;