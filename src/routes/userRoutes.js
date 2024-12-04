import express from 'express';

import * as clientController from '../controllers/userController.js';

const router = express.Router();

router.post('/users/register', clientController.createUser);
router.post('/users/login', clientController.userLogin);


export default router;