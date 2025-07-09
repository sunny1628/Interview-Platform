import Interview from '../models/Interview.js';
import User from '../models/User.js';

export const createInterview = async (req, res) => {
  try {
    const { candidateId, datetime } = req.body;

    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== 'candidate') {
      return res.status(400).json({ msg: 'Invalid candidate' });
    }

    const interview = await Interview.create({
      recruiterId: req.user._id,
      candidateId,
      datetime
    });

    res.status(201).json(interview);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const getInterviews = async (req, res) => {
  try {
    const query = req.user.role === 'recruiter' ? { recruiterId: req.user._id } : { candidateId: req.user._id };

    const interviews = await Interview.find(query).populate('recruiterId candidateId', 'name email role');
    res.status(200).json(interviews);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

export const addQuestionToInterview = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const { title, description, language } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ msg: 'Interview not found' });

    if (interview.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not your interview' });
    }

    interview.questions.push({ title, description, language });
    await interview.save();

    res.status(200).json({ msg: 'Question added', interview });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};


export const getInterviewHistory = async (req, res) => {
  try {
    const now = new Date();
    const query = req.user.role === 'recruiter'
      ? { recruiterId: req.user._id }
      : { candidateId: req.user._id };

    const interviews = await Interview.find(query).sort({ datetime: 1 });

    const upcoming = interviews.filter((i) => i.datetime > now && i.status === 'scheduled');
    const past = interviews.filter((i) => i.datetime <= now || i.status !== 'scheduled');

    res.status(200).json({ upcoming, past });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
