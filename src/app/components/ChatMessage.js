import { useState } from "react";
import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({ chat }) => {
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'playing'

  const handlePlayAudio = async (text) => {
    setStatus("loading"); // Set loading state
    try {
      const response = await fetch("https://ae70-34-16-244-191.ngrok-free.app/generate_audio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          method: "gtts",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.audio) {
        const audioData = data.audio;
        if (typeof audioData === "string") {
          const audio = new Audio(`data:audio/mp3;base64,${audioData}`);

          // Set playing state
          setStatus("playing");
          audio.play();

          // Reset when audio finishes
          audio.onended = () => {
            setStatus("idle");
          };
        } else {
          console.error("Unsupported audio format. Expected a Base64 string.");
          setStatus("idle");
        }
      } else {
        console.error("Audio data not available.");
        setStatus("idle");
      }
    } catch (error) {
      console.error("Error fetching or playing audio:", error);
      setStatus("idle");
    }
  };

  return (
    !chat.hideInChat && (
      <div className={`message ${chat.role === "model" ? "bot-message" : "user-message"}`}>
        {chat.role === "model" && <ChatbotIcon />}
              {/* Check if message contains audio */}
      {chat.audio ? (
        <audio controls className="audio-message">
          <source src={chat.audio} type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      ) : (
        <p className="message-text">{chat.text}</p>
      )}

        {/* <p className="message-text">{chat.text}</p> */}

        {chat.role === "model" && (
          <div className="flex items-center gap-2 mt-2">
            {status === "idle" && (
              <button className="speak-button" onClick={() => handlePlayAudio(chat.text)}>
                🔊 Speak
              </button>
            )}
            {status === "loading" && (
              <button className="loading-button " disabled>
                <span className="material-symbols-rounded animate-spin">autorenew</span>
              </button>
            )}
            {status === "playing" && (
              <button className="playing-button animate-pulse" disabled>
                🎵 
              </button>
            )}
          </div>
        )}
      </div>
    )
  );
};

export default ChatMessage;


// // components/ChatMessage.js
// import ChatbotIcon from "./ChatbotIcon";

// const ChatMessage = ({ chat }) => {
//   // Play audio when the "Speak" button is clicked

//   const handlePlayAudio = async (text) => {
//     try {
//       const response = await fetch("https://cdd5-34-31-124-89.ngrok-free.app/generate_audio", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           message: text,
//           method: "gtts",
//         }),
//       });
  
//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }
  
//       const data = await response.json();
//       console.log("Response from TTS API:", data);
//       console.log(data.audio)
//       if (data.audio) {
//         const audioData = data.audio; // Assuming first array element contains the audio
//         console.log("Playing audio:", audioData,);
//         if (typeof audioData === "string") {
//           // Handle Base64 string
//           const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
//           audio.play();
//         } else {
//           console.error("Unsupported audio format. Expected a Base64 string.");
//         }
//       } else {
//         console.error("Audio data not available.");
//       }
//     } catch (error) {
//       console.error("Error fetching or playing audio:", error);
//     }
//   };
  
//   // Function to format text into a list
//   const formatMessage = (text) => {
//     const lines = text.split(/(?=[१२३४५६७८९०]\.)/);
//  // Splits when a number followed by a dot appears (e.g., १.)
//  console.log(lines)
//     return (
//       <ul className="list-none pl-5">
//         {lines.map((line, index) => (
//           <li key={index} className="mb-1 ">{line.trim()}</li>
//         ))}
//       </ul>
//     );
//   };

//   return (
//     !chat.hideInChat &&(
//     <div className={`message ${chat.role === "model" ? "bot-message" : "user-message"}`}>
//       {chat.role === "model" && <ChatbotIcon />}
//       {/* <p className="message-text">{chat.text}</p>
//        */}
//        {/* Check if the message contains a numbered list */}
//        {/(?=[१२३४५६७८९०]\.)/.test(chat.text) ? formatMessage(chat.text) : <p className="message-text">{chat.text}</p>}
        

//       {/* Speak button for model messages */}
//       {chat.role === "model" && (
//         <button className="speak-button" onClick={()=>handlePlayAudio(chat.text)}>
//           🔊 Speak
//         </button>
//       )}
//     </div>
//     )
//   );
// };

// export default ChatMessage;


// "use client"
// import ChatbotIcon from "./ChatbotIcon";
// const ChatMessage = ({ chat }) => {
//   return (
//     !chat.hideInChat && (
//       <div className={`message ${chat.role === "model" ? "bot" : "user"}-message ${chat.isError ? "error" : ""}`}>
//         {chat.role === "model" && <ChatbotIcon />}
//         <p className="message-text">{chat.text}</p>
//       </div>
//     )
//   );
// };
// export default ChatMessage;