import { useEffect, useState, useRef } from "react";
import ChatbotIcon from "./components/ChatbotIcon.jsx";
import ChatForm from "./components/ChatForm.jsx";
import ChatMessage from "./components/ChatMessage.jsx";
import axios from "axios";

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    const updateHistory = (text) => {
      setChatHistory((prev) => [
        ...prev.filter((msg) => msg.text !== "Thinking..."),
        { role: "model", text },
      ]);
    };

    try {
      history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-1.5:generateContent",
        { contents: history },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY,
          },
        }
      );

      const botText = response.data.candidates[0]?.content?.parts[0]?.text.trim();
      updateHistory(botText);
    } catch (error) {
      console.error("Error generating bot response:", error);
      updateHistory("Oops! Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    // Scroll to the bottom of the chat body when new messages are added
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory]);

  return (
    // Novo container principal para o layout de tela cheia
    <div className="fullscreen-container">
      {/* A janela principal do chat, agora ocupando o espaço central */}
      <div className="chatbot-fullscreen">
        {/* Cabeçalho do Chatbot (sem o botão de fechar) */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h3>ChatBot</h3>
            <p>Online</p>
          </div>
        </div>

        {/* Corpo do Chatbot */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hey there 🧐 <br /> How can I assist you today?
            </p>
          </div>

          {/* Histórico do Chat */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* Rodapé do Chatbot */}
        <div className="chat-footer">
          <ChatForm
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            generateBotResponse={generateBotResponse}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
