const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const app = require('./app');

// connect to DB
const URL = process.env.DB_LOCAL;
const DB_ATLAST = process.env.DB_ATLAST
.replace(`<PASSWORD>`,process.env.DB_PASS)
.replace(`<DB_NAME>`,process.env.DB_NAME)

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(DB_ATLAST,options)
.then(()=>{
    console.log('Connected to Database')
})
.catch(err =>{
    console.log(err);
});

const port = process.env.PORT || 2010;

// connect to server
app.listen(port,()=>{
    console.log(`app running on port ${port}...`);
    console.log(`${process.env.NODE_ENV}`);
});