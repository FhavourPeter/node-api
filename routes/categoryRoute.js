const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {Category} = require('../model/Category')
const isLogin = require("../middlewares/isLogin");
const isAdmin = require('../middlewares/isAdmin');
const appErr = require('../helper/appErr');





// create category
router.post(`/`, isLogin, isAdmin, async (req, res, next) => {
    const name = req.body.name;
    const categoryFound = await Category.findOne({name})
    if(categoryFound){
        return next(appErr(`${name} already exist `, 403))
    }
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    });
    await category.save();
    if (!category){
        res.status(500).send("category not created");
    }
    res.send(category);
});


//get all categories from

router.get(`/`,isLogin, isAdmin, async (req, res) => {
    const categories = await Category.find();
    if (!categories){
        res.status(404).send("categories not created");
    }
    res.send(categories);
});

//get single categories
router.get(`/:id`, isLogin, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)){
        return res.status(404).send("Invalid category ID")
    }
    const categories = await Category.findById(req.params.id);
    if (!categories){
        res.status(404).send("categories not created");
    }
    res.send(categories);
});


//update categories
router.put(`/:id`, isLogin, isAdmin, async (req, res) => {
    const categories = await Category.findByIdAndUpdate(req.params.id,
        
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        
        {
            new: true,
        });
    if (!categories){
        return res.status(404).send("categories not created");
    }
    res.send(categories);
});

//remove categories
router.delete(`/:id`, isLogin, isAdmin, (req, res) => {
    Category.findByIdAndRemove(req.params.id)
    .then((category) => {
        if (category){
            return res.status(200).json({
                success: true,
                message: "This category have been successful been deleted"
            });
        }
            else {
                return res.status(500).json({
                    success: false,
                    message: "This category could not be found"
                });
            }
        })
        .catch((err) => {
            return res.status(400).json({success: false, message: err});
        });
    });

    router.get(`/get/count`,isLogin, isAdmin, async (req, res) => {
        const categoryCount = await Category.countDocuments();
        if ( !categoryCount)
        {
            res.status(404).json({ sucess: false});
    
        }
        res.send({
            categoryCount : categoryCount,
        });
    
    });



module.exports = router;