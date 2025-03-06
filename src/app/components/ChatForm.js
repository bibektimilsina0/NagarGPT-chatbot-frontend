'use client';
import { useRef, useState } from 'react';
import wavEncoder from 'wav-encoder';

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const inputRef = useRef();
  const [isListening, setIsListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Function to encode audio chunks as WAV
  const encodeAudioToWAV = async (audioChunks, sampleRate) => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext({ sampleRate });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const wavBuffer = await wavEncoder.encode({
      sampleRate: audioBuffer.sampleRate,
      channelData: [
        audioBuffer.getChannelData(0), // Left channel
        audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : audioBuffer.getChannelData(0), // Right channel
      ],
    });

    audioContext.close(); // Close the AudioContext to avoid memory leaks
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  // Add "Thinking..." message to chat history
  const addThinkingMessage = () => {
    setChatHistory((history) => [...history, { role: 'model', text: 'Thinking...' }]);
    setThinking(true);
  };

  // Handle the bot's response
  const handleResponse = (data) => {
    setChatHistory((history) => [
      ...history.filter((msg) => msg.text !== 'Thinking...'),
      { role: 'model', text: data.response || 'Response received!' },
    ]);
    setThinking(false);
  };

  // Handle errors and update chat history
  const handleError = (error) => {
    console.error('Error:', error);
    setChatHistory((prev) => [
      ...prev.filter((msg) => msg.text !== 'Thinking...'),
      { role: 'model', text: error.message || 'Something went wrong!', isError: true },
    ]);
    setThinking(false);
  };

  // Start recording
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia is not supported in this browser');
      alert('Audio recording is not supported in your browser. Please use a supported browser like Chrome or Firefox.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Encode the recorded audio as WAV
        const audioBlob = await encodeAudioToWAV(audioChunks, 16000); // Use 16kHz sample rate
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        const audioURL = URL.createObjectURL(audioBlob);

        // Add user's voice message and "Thinking..." placeholder
        setChatHistory((history) => [
          ...history,
          { role: 'user', text: 'Voice message', audio: audioURL },
        ]);
        addThinkingMessage();

        // Prepare FormData for the backend
        const formData = new FormData();
        formData.append('audio', audioFile);

        // Send the audio to the backend
        try {
          const API_URL ='https://ae70-34-16-244-191.ngrok-free.app/api/audio';
          const response = await fetch(API_URL, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          if (!data.response) {
            throw new Error('No valid response received from the server.');
          }

          handleResponse(data);
        } catch (error) {
          handleError(error);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsListening(true);
    } catch (error) {
      handleError(error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsListening(false);

      const stream = mediaRecorder.stream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());

      setMediaRecorder(null); // Clean up the mediaRecorder
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle text form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userMessage = inputRef.current.value.trim();
    if (!userMessage) return;
    inputRef.current.value = '';

    const updatedHistory = [...chatHistory, { role: 'user', text: userMessage }];
    setChatHistory(updatedHistory);
    addThinkingMessage();

    generateBotResponse(updatedHistory)
      .catch((error) => {
        handleError(error);
      })
      .finally(() => {
        setThinking(false);
      });
  };

  // Prevent Enter key from triggering the recording button
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission
      handleFormSubmit(e); // Manually trigger form submission
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="chat-form">
      <input
        ref={inputRef}
        placeholder="Message..."
        className="message-input"
        required
        disabled={thinking}
        aria-label="Type your message"
        onKeyDown={handleKeyDown} // Add keydown handler
      />
      {isListening ? (
        <button
          type="button" // Ensure it's not a submit button
          onClick={toggleRecording}
          className="m-auto flex items-center justify-center bg-red-400 hover:bg-red-500 rounded-full w-6 h-6 focus:outline-none mr-2 animate-pulse"
          aria-label="Stop recording"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path fill="white" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        </button>
      ) : (
        <button
          type="button" // Ensure it's not a submit button
          onClick={toggleRecording}
          className="m-auto flex items-center justify-center bg-[#5A3EB0] hover:bg-[#6D4FC2] rounded-full w-6 h-6 focus:outline-none mr-2"
          aria-label="Start recording"
        >
          <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white">
            <path
              fill="currentColor"
              d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"
            />
          </svg>
        </button>
      )}
      <button
        type="submit"
        id="send-message"
        className="material-symbols-rounded"
        aria-label="Send message"
        disabled={thinking}
      >
        arrow_upward
      </button>
    </form>
  );
};

export default ChatForm;

// 'use client';
// import { useRef, useState } from 'react';
// import axios from 'axios';
// import wavEncoder from 'wav-encoder';

// const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
//   const inputRef = useRef();
//   const [isListening, setIsListening] = useState(false);
//   const [thinking, setThinking] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);

//   // Function to encode audio chunks as WAV
//   const encodeAudioToWAV = async (audioChunks, sampleRate) => {
//     const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
//     const arrayBuffer = await audioBlob.arrayBuffer();
//     const audioContext = new AudioContext({ sampleRate });
//     const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

//     const wavBuffer = await wavEncoder.encode({
//       sampleRate: audioBuffer.sampleRate,
//       channelData: [
//         audioBuffer.getChannelData(0), // Left channel
//         audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : audioBuffer.getChannelData(0), // Right channel
//       ],
//     });
//     audioContext.close();
//     return new Blob([wavBuffer], { type: 'audio/wav' });
//   };

//   // Start recording
//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const recorder = new MediaRecorder(stream);
//       const audioChunks = [];

//       recorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunks.push(event.data);
//         }
//       };

//       recorder.onstop = async () => {
//         // Encode the recorded audio as WAV
//         const audioBlob = await encodeAudioToWAV(audioChunks, 16000); // Use 16kHz sample rate
//         const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });

//         const audioURL = URL.createObjectURL(audioBlob);

//         // Add "Thinking..." message
//         setChatHistory((history) => [
//           ...history,
//           { role: 'user',  text: 'Voice message',
//       audio: audioURL, },
//           { role: 'model', text: 'Thinking...' },
//         ]);
//         setThinking(true);

//         // Prepare FormData for the backend
//         const formData = new FormData();
//         formData.append('audio', audioFile);

//         // Send the audio to the backend
//         try {
//           const response = await axios.post('https://627e-34-168-246-210.ngrok-free.app/api/audio', formData, {
//             headers: { 'content-type': 'multipart/form-data' },
//           });

//           console.log('Audio upload response:', response.data);

//           // Remove "Thinking..." and add the response
//           setChatHistory((history) => [
//             ...history.filter((msg) => msg.text !== 'Thinking...'),
//             { role: 'model', text: response.data.response || 'Response received!' },
//           ]);
//         } catch (error) {
//           console.error('Error uploading audio:', error);
//         } finally {
//           setThinking(false);
//         }
//       };

//       recorder.start();
//       setMediaRecorder(recorder);
//       setIsListening(true);
//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//     }
//   };

//   // Stop recording
//   const stopRecording = () => {
//     if (mediaRecorder) {
//       mediaRecorder.stop();
//       setIsListening(false);

//       const stream = mediaRecorder.stream;
//     const tracks = stream.getTracks();
//     tracks.forEach((track) => track.stop()); 
//     setMediaRecorder(null);
//     }
//   };

//   // Toggle recording
//   const toggleRecording = () => {
//     if (isListening) {
//       stopRecording();
//     } else {
//       startRecording();
//     }
//   };

//   // Handle text form submission
//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     const userMessage = inputRef.current.value.trim();
//     if (!userMessage) return;
//     inputRef.current.value = '';

//     setChatHistory((history) => [...history, { role: 'user', text: userMessage }]);

//     // Add "Thinking..." placeholder while waiting for response
//     setChatHistory((history) => [...history, { role: 'model', text: 'Thinking...' }]);
//     setThinking(true);

//     generateBotResponse([...chatHistory, { role: 'user', text: userMessage }]).finally(() => {
//       setThinking(false);
//     });
//   };

//   return (
//     <form onSubmit={handleFormSubmit} className="chat-form">
//       <input ref={inputRef} placeholder="Message..." className="message-input" required />
//       {/* <button
//         type="button"
//         onClick={toggleRecording}
//         id="mic-button"
//         className={`material-symbols-rounded ${isListening ? 'listening' : ''}`}
//       >
//         {isListening ? 'stop_circle' : 'mic'}
//       </button> */}
//         {isListening ? (
//             <button
//               onClick={toggleRecording}
//               className=" m-auto flex items-center justify-center bg-red-400 hover:bg-red-500 rounded-full w-6 h-6 focus:outline-none mr-2 animate-pulse"
//             >
//               <svg className="h-12 w-12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                 <path fill="white" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
//               </svg>
//             </button>
//           ) : (
//             <button
//               onClick={toggleRecording}
//               className=" m-auto flex items-center justify-center bg-[#5A3EB0] hover:bg-[#6D4FC2] rounded-full w-6 h-6 focus:outline-none mr-2"
//             >
//               <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white">
//                 <path
//                   fill="currentColor"
//                   d="M128 176a48.05 48.05 0 0 0 48-48V64a48 48 0 0 0-96 0v64a48.05 48.05 0 0 0 48 48ZM96 64a32 32 0 0 1 64 0v64a32 32 0 0 1-64 0Zm40 143.6V232a8 8 0 0 1-16 0v-24.4A80.11 80.11 0 0 1 48 128a8 8 0 0 1 16 0a64 64 0 0 0 128 0a8 8 0 0 1 16 0a80.11 80.11 0 0 1-72 79.6Z"
//                 />
//               </svg>
//             </button>
//           )}
      
//       <button type="submit" id="send-message" className="material-symbols-rounded">
//         arrow_upward
//       </button>
//     </form>
//   );
// };

// export default ChatForm;


// // components/ChatForm.js
// 'use client';
// import { useRef, useState } from 'react';

// const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
//   const inputRef = useRef();
//   const [isListening, setIsListening] = useState(false);
//   const [mediaRecorder, setMediaRecorder] = useState(null);
//   const [thinking, setThinking] = useState(false);

//   // Toggle recording
//   const toggleListening = async () => {
//     if (isListening) {
//       mediaRecorder.stop();
//       setIsListening(false);
//     } else {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const recorder = new MediaRecorder(stream);
//         const audioChunks = [];

//         recorder.ondataavailable = (event) => {
//           if (event.data.size > 0) {
//             audioChunks.push(event.data);
//           }
//         };

//         recorder.onstop = async () => {
//           const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
//           const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });

//           // Add "Thinking..." message
//           setChatHistory((history) => [
//             ...history,
//             { role: 'user', text: 'AUDIO_FILE' },
//             { role: 'model', text: 'Thinking...' }
//           ]);
//           setThinking(true);

//           // Send the recorded audio to /api/audio
//           const formData = new FormData();
//           formData.append('audio', audioFile);

//           try {
//             const response = await fetch('https://627e-34-168-246-210.ngrok-free.app/api/audio', {
//               method: 'POST',
//               body: formData
//             });

//             const data = await response.json();
//             console.log(data)
//             if (response.ok) {
//               // Remove "Thinking..." and add response
//               setChatHistory((history) => [
//                 ...history.filter((msg) => msg.text !== 'Thinking...'),
//                 { role: 'model', text: data.response || 'Response received!' }
//               ]);
//               setThinking(false);
//             } else {
//               console.error('Failed to upload audio.');
//               setThinking(false);
//             }
//           } catch (error) {
//             console.error('Error uploading audio:', error);
//             setThinking(false);
//           }
//         };

//         recorder.start();
//         setMediaRecorder(recorder);
//         setIsListening(true);
//       } catch (error) {
//         console.error('Error accessing microphone:', error);
//       }
//     }
//   };

//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     const userMessage = inputRef.current.value.trim();
//     if (!userMessage) return;
//     inputRef.current.value = '';

//     setChatHistory((history) => [...history, { role: 'user', text: userMessage }]);

//     // Add "Thinking..." placeholder while waiting for response
//     setChatHistory((history) => [...history, { role: 'model', text: 'Thinking...' }]);
//     setThinking(true);

//     generateBotResponse([...chatHistory, { role: 'user', text: userMessage }]).finally(() => {
//       setThinking(false);
//     });
//   };

//   return (
//     <form onSubmit={handleFormSubmit} className="chat-form">
//       <input ref={inputRef} placeholder="Message..." className="message-input" required />
//       <button
//         type="button"
//         onClick={toggleListening}
//         id="mic-button"
//         className={`material-symbols-rounded ${isListening ? 'listening' : ''}`}
//       >
//         {isListening ? 'stop_circle' : 'mic'}
//       </button>
//       <button type="submit" id="send-message" className="material-symbols-rounded">
//         arrow_upward
//       </button>

//     </form>
//   );
// };

// export default ChatForm;






// 'use client'
// import { useRef } from "react";
// const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
//   const inputRef = useRef();
//   const handleFormSubmit = (e) => {
//     e.preventDefault();
//     const userMessage = inputRef.current.value.trim();
//     if (!userMessage) return;
//     inputRef.current.value = "";
//     // Update chat history with the user's message
//     setChatHistory((history) => [...history, { role: "user", text: userMessage }]);
//     // Delay 600 ms before showing "Thinking..." and generating response
//     setTimeout(() => {
//       // Add a "Thinking..." placeholder for the bot's response
//       setChatHistory((history) => [...history, { role: "model", text: "Thinking..." }]);
//       // Call the function to generate the bot's response
//       generateBotResponse([...chatHistory, { role: "user", text: `Using the details provided above, please address this query: ${userMessage}` }]);
//     }, 600);
//   };
//   return (
//     <form onSubmit={handleFormSubmit} className="chat-form">
//       <input ref={inputRef} placeholder="Message..." className="message-input" required />
//       <button type="submit" id="send-message" className="material-symbols-rounded">
//         arrow_upward
//       </button>
//     </form>
//   );
// };
// export default ChatForm;
