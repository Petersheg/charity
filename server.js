const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const app = require('./app');

// connect to DB
let DB_CONNECT;

if (process.env.NODE_ENV === "development") {
    DB_CONNECT = process.env.DB_LOCAL;
    console.log(process.env.DB_ATLAST)
}else{
    DB_CONNECT = process.env.DB_ATLAST
    .replace(`<PASSWORD>`,process.env.DB_PASS)
    .replace(`<DB_NAME>`,process.env.DB_NAME);
}

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}

mongoose.connect(DB_CONNECT,options)
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