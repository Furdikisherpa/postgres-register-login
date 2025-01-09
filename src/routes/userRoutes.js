import express from 'express';

import * as userController from '../controllers/userController.js';
import {testmiddleware} from '../middleware/testmiddleware.js';

const router = express.Router();

router.post('/users/register', userController.createUser);
router.post('/users/login', userController.userLogin);
router.post('/send-email', userController.sendEmailToUser );
router.post('/resend_otp', userController.ResendOTP);
router.post('/verify', userController.VerifyEmail) //new route

router.route('/testmiddleware').get(testmiddleware, (req, res) =>{
    console.log("hello");
    res.status(200).send("You have accessed a middleware route get");
}).post((req,res) => {
    console.log("hi");
    res.status(200).send("You have accessed a middleware route post");
})


export default router;