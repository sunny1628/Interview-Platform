import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


export default function ScheduleInterview() {
  const [candidates, setCandidates] = useState([]);
  const [candidateId, setCandidateId] = useState('');
  const [datetime, setDatetime] = useState(new Date());
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/auth/users?role=candidate')
      .then((res) => setCandidates(res.data))
      .catch(() => setError('Failed to load candidates'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/interview/create', {
        candidateId,
        datetime,
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-xl w-full max-w-md space-y-6 shadow-lg border border-gray-700"
      >
        <h2 className="text-2xl font-bold text-center">Schedule Interview</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <select
          value={candidateId}
          onChange={(e) => setCandidateId(e.target.value)}
          className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none"
          required
        >
          <option value="">Select Candidate</option>
          {candidates.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} ({c.email})
            </option>
          ))}
        </select>

        <div>
          <label className="block mb-1 text-sm text-gray-400">Select Date & Time</label>
          <DatePicker
            selected={datetime}
            onChange={(date) => setDatetime(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="Pp"
            className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded text-white font-semibold"
        >
          Schedule
        </button>
      </form>
    </div>
  );
}
