import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    datetime: { type: Date, required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    questions: [
      {
        title: String,
        description: String,
        language: String
      }
    ],
    codeHistory: [
      {
        code: String,
        timestamp: Date
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);
