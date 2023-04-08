import { Router } from 'express';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';
import validateObjectId from '../middleware/validateObjectId.js';
import {
  getAll,
  getOne,
  create,
  update,
  remove,
} from '../controllers/customers.js';

const router = Router();

router.get('/', [auth, admin], getAll);
router.post('/', [auth, admin], create);
router.get('/:id', [auth, admin, validateObjectId], getOne);
router.put('/:id', [auth, admin, validateObjectId], update);
router.delete('/:id', [auth, admin, validateObjectId], remove);

export default router;
