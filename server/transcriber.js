import EventEmitter from 'events';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

class Transcriber extends EventEmitter {
  constructor() {
    super();
    this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    this.connection = null;
  }

  async startTranscriptionStream(sampleRate) {
    this.connection = this.deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      encoding: 'linear16',
      sample_rate: sampleRate,
    });

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('Deepgram connection opened');
      this.emit('transcriber-ready');
    });

    this.connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed');
    });

    this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      data.channel.alternatives.forEach((alternative) => {
        if (alternative.transcript) {
          if (data.is_final) {
            this.emit('final', alternative.transcript);
          } else {
            this.emit('partial', alternative.transcript);
          }
        }
      });
    });

    this.connection.on(LiveTranscriptionEvents.Metadata, (data) => {
      console.log(data);
    });

    this.connection.on(LiveTranscriptionEvents.Error, (err) => {
      console.error(err);
      this.emit('error', err.message);
    });
  }

  endTranscriptionStream() {
    if (this.connection) {
      this.connection.finish();
      this.connection = null;
    }
  }

  send(audioData) {
    if (this.connection) {
      setTimeout(() => this.connection.send(audioData), 5000);
    }
  }
}

export default Transcriber;
