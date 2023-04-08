import { Router } from 'express';
import auth from '../middleware/auth.js';
import { getUser, registerUser } from '../controllers/users.js';

const router = Router();

router.get('/me', auth, getUser);
router.post('/', registerUser);

export default router;
