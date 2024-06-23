import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const serverURL = 'http://localhost:8080';
const subscriptions = ['final', 'partial', 'transcriber-ready', 'error'];

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [transcriptions, setTranscriptions] = useState({
    partial: '',
    final: '',
  });

  useEffect(() => {
    const newSocket = io(serverURL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    subscriptions.forEach((event) => {
      socket.on(event, (data) => {
        if (event === 'final') {
          setTranscriptions((prev) => ({
            ...prev,
            final: prev.final + ' ' + data,
            partial: '',
          }));
        } else if (event === 'partial') {
          setTranscriptions((prev) => ({
            ...prev,
            partial: data,
          }));
        }
      });
    });

    return () => {
      subscriptions.forEach((event) => {
        socket.off(event);
      });
    };
  }, [socket]);

  const initialize = () => {
    // This function can be used to initialize any socket connections or events if needed
  };

  const disconnect = () => {
    socket?.disconnect();
  };

  const sendAudio = (audioData) => {
    socket?.emit('incoming-audio', audioData);
  };

  const configureStream = (sampleRate) => {
    socket?.emit('configure-stream', { sampleRate });
  };

  const stopStream = () => {
    socket?.emit('stop-stream');
  };

  return {
    initialize,
    disconnect,
    sendAudio,
    configureStream,
    stopStream,
    transcriptions,
  };
};

export default useSocket;
