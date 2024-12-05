import express from 'express';

import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/users/register', userController.createUser);
router.post('/users/login', userController.userLogin);
router.post('/send-email', userController.sendEmailToUser )


export default router;