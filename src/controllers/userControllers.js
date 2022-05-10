const userModel = require("../models/userModel")
const validator = require("../validator/validator")
const jwt = require("jsonwebtoken");

// To create a user
const createUser = async function (req, res) {
    try {
        const data = req.body
        // Checking input from req.body
        if (Object.keys(data) == 0) {
            return res.status(400).send({ status: false, msg: "Bad Request, No Data Provided" })
        };

        const { title, name, email, phone, password, address } = data

        // Title is mandatory
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, msg: "Please enter title" })
        }
        // Name is mandatory
        if (!validator.isValid(name)) {
            return res.status(400).send({ status: false, msg: "Please enter name" })
        }
        // Email id is mandatory
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Please enter email id" })
        }
        // Phone no is mandatory
        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, msg: "Please enter phone" })
        }
        // Password is mandatory
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, msg: "Please enter password" })
        }

        let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        // Checking if the inputted email id perfectely formatted or not
        if (!(data.email.match(mailFormat))) {
            return res.status(400).send({ msg: "Valid Email Id is Required" })
        }
        // Checking the inputted email id from request body from existing database to avoid duplicacy 
        let findEmail = await userModel.findOne({ email: data.email })
        if (findEmail) {
            return res.status(400).send({ status: false, msg: "Email id is already registerd" })
        }

        // This is the moblie no format for checking if the inputted mobile no 10 digited or not
        let phoneNo = /^\d{10}$/;
        if (!phoneNo.test(data.phone)) {
            return res.status(400).send({ msg: "Valid Mobile number is Required" })
        }
        // Checking the inputted phonee no from request body from existing database to avoid duplicacy 
        let findPhone = await userModel.find({ phone: data.phone })
        if (findPhone.length != 0) {
            return res.status(400).send({ status: false, msg: "Mobile number is already registered" })
        }

        // Checking the inputted password's length and it should be 8 to 15 digits and contains atleast one uppercase or lowercase character
        let passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%&*]{8,15}$/;
        if (!(passwordPattern.test(data.password))) {
            return res.status(400).send({ msg: "Password length should be 8 to 15 digits and enter atleast one uppercase or lowercase" })
        }

        // Taking data from request body and creating a user
        let createUser = await userModel.create(data)
        return res.status(201).send({ status: true, msg: "User has been created successfully", createUser })

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


// Login for a user
const userLogin = async function(req, res){
    try{
        const data = req.body
        // Checking input from req.body
        if (Object.keys(data) == 0) {
            return res.status(400).send({ status: false, msg: "Bad Request, No Data Provided" })
        };

        // const {email, password} = data
        let email = data.email
        let password = data.password

        // Email id is mandatory
        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, msg: "Please enter email id" })
        }
        // Password is mandatory
        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, msg: "Please enter password" })
        }
        // Checking the inputted email id from request body from existing database for a valid user
        let findEmail = await userModel.findOne({email: data.email})
        if(!findEmail){
            return res.status(400).send({ status: false, msg: "Email id is not registered" })
        }
        // Checking the inputted phone no from request body from existing database for a valid user
        let findPassword = await userModel.findOne({password: data.password})
        if(!findPassword){
            return res.status(400).send({ status: false, msg: "Password is not matched" })
        }

        // Generating a token after every successfull login and also adding token expiration time
        let token = await jwt.sign({userId: findEmail._id.toString()}, "India", {expiresIn: '24h'})
        res.status(201).send({status: true, msg:"Log in successfull", token})

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}

module.exports.createUser = createUser
module.exports.userLogin = userLogin