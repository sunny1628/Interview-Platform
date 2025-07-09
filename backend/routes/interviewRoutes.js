import express from 'express';
import { createInterview, getInterviews } from '../controllers/interviewController.js';
import { verifyToken, authorizeRoles } from '../middlewares/authMiddleware.js';
import { getInterviewHistory } from '../controllers/interviewController.js';
import { addQuestionToInterview } from '../controllers/interviewController.js';


const router = express.Router();

router.post('/create', verifyToken, authorizeRoles('recruiter'), createInterview);
router.get('/all', verifyToken, getInterviews);



router.post(
  '/:id/add-question',
  verifyToken,
  authorizeRoles('recruiter'),
  addQuestionToInterview
);


router.get('/history', verifyToken, getInterviewHistory);
router.get('/:id', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



export default router;