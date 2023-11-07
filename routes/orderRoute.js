const express = require('express');
const router = express.Router();
const isLogin = require("../middlewares/isLogin");
const isAdmin = require('../middlewares/isAdmin');
const appErr = require('../helper/appErr');
const { Order } = require('../model/Order');
const { OrderItem } = require('../model/Order-item');


router.post('/', isLogin, async (req, res, next) => {
    const {
        orderItems,
        shippingAddress1,
        shippingAddress2,
        city,
        zip,
        country,
        phone,
        status,
        totalPrice,
        user,
    } = req.body

    console.log(req.userAuth)

    const orderItemsIds = Promise.all(
        orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                quantity: orderItem.quantity,
                product: orderItem.product,
            });
            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
        })
    );
    
    const orderItemsIdsResolved = await orderItemsIds;
    const totalPrices = await Promise.all(
        orderItemsIdsResolved.map(async(orderItemsId) => {
            const orderItem = await OrderItem.findById(orderItemsId).populate(
                "product",
                "price"
            );
            const totalSum = orderItem.product.price * orderItem.quantity;
            return totalSum
        })
    );

    

    const sum = totalPrices.reduce((a,b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1,
        shippingAddress2,
        city,
        zip,
        country,
        phone,
        status,
        totalPrice: sum,
        user: req.userAuth
    });
    order = await order.save();
    if (!order){
        return next(appErr('Order cannot be made', 404))
    }
    res.send(order)
});


router.get(`/`,  isLogin, isAdmin, async(req, res, next)=>{
    const orderList = await Order.find().populate(
        "orderItems"
        );
    if(!orderList){
        return next(appErr(`Order cannot be found`, 404))
    } 
    res.send(orderList)
})

router.get(`/single-order`, isLogin, async(req, res, next)=>{
    const order = await Order.find({user: req.userAuth})
    .populate('user', 'name')
    .populate({
        path: 'orderItems',
        populate: { path: "product", populate: "category"}
    })
    .sort({ dateOrdered: -1});
    if(!order){
        return next(appErr(`Order with the id is not found`, 404))
    } 
    res.send(order)
})


//get total sale
router.get(`/totalsales`, async (req, res, next) => {
    const totalSales = await Order.aggregate([        
        { $group: { _id: null, totalsales: { $sum: "$totalPrice"}}}
    ]);
    if (!totalSales){
        return next(appErr('This order sales cannot be generated', 403))
    }
    res.send({ totalSales: totalSales.pop().totalSales})

})









//update order
router.put(`/:id`, isLogin, isAdmin, async (req, res) => {
    const orders = await Order.findByIdAndUpdate(req.params.id,
        
        {
                // orderItems: req.body.orderItem,
                // shippingAddress1: req.body.shippingAddress1,
                // shippingAddress2: req.body.shippingAddress2,
                // city: req.body.city,
                // zip: req.body.zip,
                // country: req.body.country,
                // phone: req.body.phone,
                status: req.body.status,
                // totalPrice: req.body.totalPrice,
                // user: req.body.user,
        },
        
        {
            new: true,
        });
    if (!orders){
        return res.status(404).send("order not found");
    }
    res.send(orders);
});


//delete order
router.delete(`/:id`, isLogin, isAdmin, (req, res) => {
    Order.findByIdAndRemove(req.params.id)
    .then((order) => {
        if (order){
            return res.status(200).json({
                success: true,
                message: "This order have been successful been deleted"
            });
        }
            else {
                return res.status(500).json({
                    success: false,
                    message: "This order could not be found"
                });
            }
        })
        .catch((err) => {
            return res.status(400).json({success: false, message: err});
        });
    });


//count order
router.get(`/count`, isLogin, isAdmin,  async (req, res, next) => {
    const orderCount = await Order.countDocuments();
    if ( !orderCount)
        {
            res.status(404).json({ sucess: false});
        }
        res.send({
            orderCount : orderCount,
        });
        
    });


module.exports = router