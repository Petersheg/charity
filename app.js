const express = require('express');
const helmet = require("helmet");
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const userRoute = require('./route/user');
const merchantRoute = require('./route/merchant');
const productRoute = require('./route/product');
const adminRoute = require('./route/admin');
const OperationalError = require('./utility/operationalError');
const globalErrorHandler = require('./controller/errorHandler/globalErrorHandler');

const app = express();

// Enable cors on all routes
app.use(cors());

// To remove unwanted characters from the query:
app.use(mongoSanitize());

// Place security https header;
app.use(helmet());

// Prevent against xss attacks
app.use(xss());

// Make body parser available
app.use(express.json());

// Register all routes
app.use('/api/v1/users',userRoute);
app.use('/api/v1/merchants',merchantRoute);
app.use('/api/v1/products',productRoute);
app.use('/api/v1/admin',adminRoute);


// handle all Unregister routes
app.all('*',(req,res,next)=>{
    next(new OperationalError(`${req.originalUrl} is not a valid route`,440));
});

app.use(globalErrorHandler);

module.exports = app;