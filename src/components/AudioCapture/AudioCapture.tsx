import { useState, useEffect, useRef } from 'react';

const AudioCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      stopRecording();
    };
  }, []);

  const startRecording = async () => {
    try {
      // Get user's audio input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);

      // Create an audio context
      const audioContext = new window.AudioContext();
      audioContextRef.current = audioContext;

      // Create an analyser node
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;

      // Connect the audio stream to the audio context
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Start visualizing audio data
      visualizeAudio();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    // Stop the audio stream
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
      setAudioStream(null);
    }

    // Stop the audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Cancel animation frame for visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsRecording(false);
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const renderFrame = () => {
      analyser.getByteFrequencyData(dataArray);

      // Example visualization: log frequencies to the console
      console.log('Audio Data:', dataArray);

      // Repeat the visualization
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();
  };

  return (
    <div>
      <h1>Real-Time Audio Capture</h1>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
    </div>
  );
};

export default AudioCapture;
