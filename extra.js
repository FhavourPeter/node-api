require('dotenv').config()
const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

const api = process.env.API_URL;


//Middleware
app.use(express.json());
app.use(morgan("tiny"));


const productSchema = mongoose.Schema({
    namw: String,
    image: String,
    price: Number,
    countInStock: Number,
});

const product = mongoose.model("product", productSchema); 


mongoose.connect(process.env.CONNECTION_STRING, {
        useNewUrlParser: true,
        UseUnifiedTopology: true,
    }).then(() => {
        console.log('Database connection is ready...');
    }).catch((err) => {
        console.log(err);
    })

// app.get(`${api}/products`, (req, res) => {
//     const products = {
//         id: 1,
//         name: `Samsung`,
//         price: 1000
//     }
//     res.send(products);
// })


app.get(`${api}/products`, async (req, res) => {
    const products = await Product.find();
    res.send(products);
});

app.post(`${api}/products`, (req, res) => {
    const product = new Products ({
        name: req.body.name,
        image: req.body.image,
        price: req.body.price,
        countInstock: req.body.countInStock,
    });
    product.save().then((createdProduct) => {
        res
            .status(201)
            .json(ceatedProduct)
            .catch((err) => {
                res.status(500).json({
                    error: err,
                    success: false,
                });
            });

    });

});



// app.post(`${api}/products`, (req, res) => {
//     const newProducts =  req.body
//     res.send(newProducts);
// })

// app.get(('/'), (req, res) => {
// res.send('welcome')
// })



app.listen(3000, () => {
    console.log('server is running on http://localhost:3000')
})