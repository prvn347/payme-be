const express = require("express")
const bcrypt = require("bcrypt");
const { userValidate, userSignIn } = require("../zod")
const { User,Account } = require("../db")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");
const zod = require('zod')

const app = express()
const router = express.Router()

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})
router.post("/signup", async function(req,res){
    const bodyPayload = req.body;
    const payloadParser = userValidate.safeParse(bodyPayload)

    if(!payloadParser.success){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }
    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const user = await User.create({
        username: req.body.username,
        password: hash,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    const userId = user._id;
    await Account.create({
        userId,
        balence: 1+ Math.random()*10000
    })
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })
})
router.post("/signin", async function(req, res) {
    const bodyPayload = req.body;
    const parserPayload = userSignIn.safeParse(bodyPayload);

    if (!parserPayload.success) {
        return res.status(400).json({
            message: "Incorrect inputs"
        });
    }

    const user = await User.findOne({
        username: req.body.username
    });

    if (!user) {
        return res.status(401).json({
            message: "User not found"
        });
    }

    const isValidPassword = await bcrypt.compare(req.body.password, user.password);

    if (isValidPassword) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        return res.json({
            token: token
        });
    }

    res.status(401).json({
        message: "Invalid username or password"
    });
});

router.put("/",authMiddleware,async function(req,res){
    const { success } = updateBody.safeParse(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

		await User.updateOne({ _id: req.userId }, req.body);
	
    res.json({
        message: "Updated successfully"
    })
})
router.get("/me",authMiddleware,async(req,res)=>{
   
   
    const oneUsers = await User.findOne({
        _id: req.userId

    })
    res.json({
        name: oneUsers.firstName
    })
})
router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})
module.exports = router