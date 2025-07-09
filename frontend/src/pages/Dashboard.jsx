import { useEffect, useState } from 'react';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [interviews, setInterviews] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const fetchInterviews = async () => {
    try {
      const res = await API.get('/interview/all');
      setInterviews(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleJoin = (id) => {
    navigate(`/interview/${id}`);
  };

  return (
    <div className="min-h-screen px-4 py-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {user.role === 'recruiter' ? 'Recruiter Dashboard' : 'Candidate Dashboard'}
        </h1>

        {user.role === 'recruiter' && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => navigate('/schedule')}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
            >
              Schedule Interview
            </button>
          </div>
        )}

        <div className="space-y-4">
          {interviews.length === 0 ? (
            <p className="text-gray-400 text-center">No interviews yet.</p>
          ) : (
            interviews.map((item) => (
              <div
                key={item._id}
                className="bg-gray-800 border border-gray-700 p-5 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="text-lg font-semibold">
                    {user.role === 'recruiter'
                      ? `Interview with ${item.candidateId?.name || 'Candidate'}`
                      : `Interview by ${item.recruiterId?.name || 'Recruiter'}`}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(item.datetime).toLocaleString()}
                  </p>
                  <p className="text-sm text-yellow-400">Status: {item.status}</p>
                </div>

                <div>
                  {item.status === 'scheduled' && (
                    <button
                      onClick={() => handleJoin(item._id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                    >
                      Join Interview
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
