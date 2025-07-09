import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import API from '../utils/api';

export default function InterviewRoom() {
  const { id: interviewId } = useParams();
  const socket = useRef();
  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef(null);

  const [streamReady, setStreamReady] = useState(false);
  const [stream, setStream] = useState(null);
  const [code, setCode] = useState('// Write C++ code here');
  const [interview, setInterview] = useState(null);

 useEffect(() => {
  socket.current = io('http://localhost:5000');

  API.get(`/interview/${interviewId}`)
    .then((res) => setInterview(res.data))
    .catch((err) => console.error('❌ Interview fetch error:', err));

  navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((userStream) => {
    setStream(userStream);
    if (myVideo.current) myVideo.current.srcObject = userStream;

    socket.current.emit('joinRoom', interviewId);
    console.log('[JOINED ROOM]', interviewId);

    // ✅ Now set signaling listeners safely inside stream
    socket.current.on('initiate-call', (targetId) => {
      console.log('[INITIATOR] creating peer');
      const peer = new Peer({ initiator: true, trickle: false, stream: userStream });

      peer.on('signal', (signal) => {
        socket.current.emit('send-signal', { targetId, signal });
      });

      peer.on('stream', (remoteStream) => {
        if (userVideo.current) userVideo.current.srcObject = remoteStream;
      });

      peerRef.current = peer;
    });

    socket.current.on('receive-signal', ({ signal, callerId }) => {
      console.log('[RECEIVER] responding to signal');
      const peer = new Peer({ initiator: false, trickle: false, stream: userStream });

      peer.on('signal', (returnSignal) => {
        socket.current.emit('return-signal', { callerId, signal: returnSignal });
      });

      peer.on('stream', (remoteStream) => {
        if (userVideo.current) userVideo.current.srcObject = remoteStream;
      });

      peer.signal(signal);
      peerRef.current = peer;
    });

    socket.current.on('accept-signal', ({ signal }) => {
      if (peerRef.current) peerRef.current.signal(signal);
    });

    socket.current.on('codeUpdate', (incomingCode) => {
      if (incomingCode !== code) {
        setCode(incomingCode);
      }
    });
  });

  return () => {
    if (socket.current) socket.current.disconnect();
  };
}, [interviewId]);


  useEffect(() => {
    if (!streamReady || !stream) return;

    // INITIATOR
    socket.current.on('initiate-call', (targetId) => {
      console.log('[INITIATOR] creating peer');
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });

      peer.on('signal', (signal) => {
        socket.current.emit('send-signal', { targetId, signal });
      });

      peer.on('stream', (remoteStream) => {
        console.log('[INITIATOR] got remote stream');
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      peerRef.current = peer;
    });

    // RECEIVER
    socket.current.on('receive-signal', ({ signal, callerId }) => {
      console.log('[RECEIVER] responding to signal');
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
      });

      peer.on('signal', (returnSignal) => {
        socket.current.emit('return-signal', { callerId, signal: returnSignal });
      });

      peer.on('stream', (remoteStream) => {
        console.log('[RECEIVER] got remote stream');
        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      peer.signal(signal);
      peerRef.current = peer;
    });

    socket.current.on('accept-signal', ({ signal }) => {
      console.log('[INITIATOR] signal accepted');
      peerRef.current?.signal(signal);
    });

    // CODE SYNC
    socket.current.on('codeUpdate', (incomingCode) => {
      if (incomingCode !== code) {
        setCode(incomingCode);
      }
    });
  }, [streamReady, stream]);

  const handleCodeChange = (val) => {
    setCode(val);
    socket.current.emit('codeChange', { interviewId, code: val });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Questions Panel */}
      <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 shadow col-span-1 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-3">Questions</h2>
        {interview?.questions?.length > 0 ? (
          interview.questions.map((q, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-semibold text-blue-400 mb-1">Q{i + 1}: {q.title}</h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{q.description}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No questions added yet.</p>
        )}
      </div>

      {/* Video + Editor */}
      <div className="col-span-2 space-y-4">
        <div className="flex gap-4 justify-center">
          <video
            ref={myVideo}
            autoPlay
            muted
            playsInline
            className="w-1/2 rounded-lg border border-gray-700"
          />
          <video
            ref={userVideo}
            autoPlay
            playsInline
            className="w-1/2 rounded-lg border border-gray-700"
          />
        </div>

        <div className="bg-gray-900 p-4 rounded-lg shadow border border-gray-700">
          <CodeMirror
            value={code}
            height="400px"
            theme="dark"
            extensions={[cpp()]}
            onChange={handleCodeChange}
          />
        </div>
      </div>
    </div>
  );
}
