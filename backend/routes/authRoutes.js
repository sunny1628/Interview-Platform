import express from 'express';
import { register, login , getUsersByRole} from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/users', verifyToken, getUsersByRole);

export default router;

