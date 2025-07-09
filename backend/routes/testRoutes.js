import express from 'express';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get(
  '/protected',
  verifyToken,
  authorizeRoles('recruiter'),
  (req, res) => {
    res.json({ msg: `Welcome ${req.user.name}, you are authorized!`, role: req.user.role });
  }
);

export default router;
