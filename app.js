require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const productRouter = require("./routes/productRoute")
const categoryRouter = require("./routes/categoryRoute")
const userRouter = require("./routes/userRoute")
const orderRouter = require("./routes/orderRoute")
const cors = require('cors');
const globalErrhandler = require('./middlewares/globalErrhandler');



app.use(cors());
app.options("*", cors());



const api = process.env.API_URL;


//Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));


app.use(`${api}/product`, productRouter)
app.use(`${api}/category`, categoryRouter)
app.use(`${api}/user`, userRouter)
app.use(`${api}/order`, orderRouter)

//error handlers middleware
app.use(globalErrhandler)

//404 error
app.use("*", (req, res) => {
    res.status(404).json({
        message: '$(req.originalUrl) - Route not found'
    })
})





mongoose.connect(process.env.CONNECTION_STRING, {
        useNewUrlParser: true,
        UseUnifiedTopology: true,
        dbName: 'e-shop'
    }).then(() => {
        console.log('Database connection is ready...');
    }).catch((err) => {
        console.log(err);
    })









app.listen(5000, () => {
    console.log('server is running on http://localhost:5000')
})