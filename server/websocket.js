import Transcriber from './transcriber.js';

const initializeWebSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`connection made (${socket.id})`);

    let transcriber;
    socket.on('configure-stream', async ({ sampleRate }) => {
      try {
        transcriber = new Transcriber();
        await transcriber.startTranscriptionStream(sampleRate);

        transcriber.on('partial', (result) => {
          socket.emit('partial', result);
        });

        transcriber.on('final', (result) => {
          socket.emit('final', result);
        });

        transcriber.on('error', (error) => {
          socket.emit('error', error);
        });

        transcriber.on('transcriber-ready', () => {
          console.log('Transcriber ready');
        });

      } catch (error) {
        console.error('Error initializing transcriber:', error);
        socket.emit('error', error.message);
      }
    });

    socket.on('incoming-audio', (audioData) => {
      if (transcriber) {
        transcriber.send(audioData);
      }
    });

    socket.on('stop-stream', () => {
      if (transcriber) {
        transcriber.endTranscriptionStream();
      } else {
        console.warn('Transcriber is not initialized yet. Make sure to configure-stream first.');
      }
    });

    socket.on('disconnect', () => {
      console.log(`connection closed (${socket.id})`);
      if (transcriber) {
        transcriber.endTranscriptionStream();
      }
    });
  });
  return io;
};

export default initializeWebSocket;
