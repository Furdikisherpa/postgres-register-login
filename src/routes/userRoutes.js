import express from 'express';

import * as clientController from '../controllers/userController.js';

const router = express.Router();

router.post('/users/register', clientController.createUser);


export default router;