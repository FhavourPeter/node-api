const express = require('express');
const bcrypt = require("bcryptjs");
const { User } = require('../model/User');
const generateToken = require("../helper/generateToken");
const isLogin = require("../middlewares/isLogin");
const isAdmin = require('../middlewares/isAdmin');
const appErr = require('../helper/appErr');
const router = express.Router();



//register
router.post(`/register`, async (req, res) => {
    const {
        name,
        email,
        password,
        phone,
        isAdmin,
        street,
        apartment,
        zip,
        city,
        country,
    } = req.body;

    const userFound = await User.findOne({ email });
    if (userFound){
        return res.status(401).json({ message: "User already exist"});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
        name,
        email,
        passwordHash: hashedPassword,
        phone,
        isAdmin,
        street,
        apartment,
        zip,
        city,
        country,
    });
    await user.save();
    if (!user) {
        res.status(500).send("User not created");
    }
    res.send(user);
});


//login
router.post(`/login`, async (req, res) =>{
    const { email, password } = req.body;
    //check if email exist
    const userEmailFound = await User.findOne({ email});
    if(!userEmailFound ){
    return res.json({
        message:"Invalid Login credentials",
    });
    }

    //verify password
    const isPasswordMatched = await bcrypt.compare(
        password,
        userEmailFound.passwordHash
    );
    if(!isPasswordMatched){
        return res.json({message: "Invalid login credentials"});
    }

    res.json({
        status: "success",
        data: {
            email: userEmailFound.email,
            name: userEmailFound.name,
            isAdmin: userEmailFound.isAdmin,
        token: generateToken(userEmailFound._id),
        },
    });
});


//get all user
router.get("/", async (req, res) => {
    const users = await User.find();
    if(!users){
        return res.status(500).json({ message: "No user found"})
    }

    res.status(200).send(users);
})

//get all user by admin
router.get("/isAdmin" , isLogin, isAdmin, async (req, res) => {
    const users = await User.find();
    if(!users){
        return res.status(500).json({ message: "No user found"})
    }

    res.status(200).send(users);
})

//user profile
router.get("/profile", isLogin, async(req, res) => {
    const user = await User.findById(req.userAuth);
    if (!user){
        return res.status(500).json({ message: "No user with the id found"})
    }
    return res.status(400).send(user)
})

//get single user by admin
router.get("/:id", isLogin, isAdmin, async (req, res) => {
    const user = await User.findById(req.params.id)
    if(!user){
        return res.status(400).json({message: "user not found"})
    }
    res.status(500).send(user)
})


//update user
router.put("/:id", isLogin, isAdmin, async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id,
        
        {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        {
            new: true
        })

    if(!user){
        return res.status(500).json({message: "user not update"})
    }
    return res.status(400).send(user)
})

//delete user
router.delete("/:id", isLogin, isAdmin, async (req, res) => {
    const deleteUser = await User.findByIdAndRemove(req.params.id)
    if(!deleteUser){
        return res.status(400).json({
            success: false,
            message: "user not found"
        })
    }else{
        return res.status(500).json({
            success: true,
            message: "successful"
        })
    }
})

//count user
router.get('/count', isLogin, isAdmin,async (req, res) => {
    const countUser = await User.countDocument()
    if(!countUser){
        return res.status(400).json({
            success: false
        })
    }
else{
    return res.status(500).json({
        success: true,
        countUser : countUser
    })
}
})

    module.exports = router;












