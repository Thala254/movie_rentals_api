import { Router } from 'express';
import auth from '../middleware/auth.js';
import create from '../controllers/returns.js';

const router = Router();

router.post('/', auth, create);

export default router;
