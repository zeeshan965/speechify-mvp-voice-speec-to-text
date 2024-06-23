import { useEffect, useState } from 'react';
import useAudioRecorder from './useAudioRecorder';
import useSocket from './useSocket';

function App() {
    const { initialize, sendAudio, configureStream, stopStream, transcriptions } = useSocket();
    const { startRecording, stopRecording, isRecording } = useAudioRecorder({
        dataCb: (data) => sendAudio(data),
    });

    const [text, setText] = useState("");

    useEffect(() => {
        initialize();
    }, []);

    const onStartRecordingPress = async () => {
        const sampleRate = await startRecording();
        configureStream(sampleRate);
    };

    const onStopRecordingPress = async () => {
        stopRecording();
        stopStream();
    };

    const handleClear = () => {
        setText("");
        setTranscriptions({ partial: "", final: "" });
    }

    return (
        <div>
            <h1>Speechify Voice Notes</h1>
            <p>Record or type something in the textbox.</p>
            <button onClick={onStartRecordingPress} disabled={isRecording}>
                Start Recording
            </button>
            <button onClick={onStopRecordingPress} disabled={!isRecording}>
                Stop Recording
            </button>
            <textarea
                value={transcriptions.partial || transcriptions.final || text}
                onChange={(e) => setText(e.target.value)}
                rows="10"
                cols="50"
            />
            <button onClick={() => navigator.clipboard.writeText(transcriptions.final || text)}>
                Copy Transcription
            </button>
            <button onClick={handleClear}>
                Clear Transcription
            </button>
        </div>
    );
}

export default App;
