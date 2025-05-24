import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

function Explore(props) {
  // États initiaux
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Bonjour ! Comment puis-je vous aider à planifier votre voyage ?' }
  ]);
  const [voyage, setVoyage] = useState({
    destination: "",
    durée: "",
    activités: "",
    budget: "",
    conseils: "",
    questions: []
  });

  // Références
  const messagesEndRef = useRef(null);
  const [sessionId] = useState(() => 'user_' + Math.random().toString(36).substr(2, 9));

  // Fonctions utilitaires
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effets
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    props.addLog({ date: new Date(), message: "il a accédé à la page explore" });
  }, []);

  // Gestionnaire d'envoi de message
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMessage = { from: 'user', text: inputText };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputText,
          sessionId: sessionId,
          currentVoyage: voyage
        })
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();

      if (data.reply?.length > 0) {
        const botMessages = data.reply.map(reply => {
          try {
            const jsonMatch = reply.text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[1]);
              
              setVoyage(prev => {
                const updatedVoyage = { ...prev };
                Object.entries(jsonData).forEach(([key, value]) => {
                  if (value) updatedVoyage[key] = value;
                });
                return updatedVoyage;
              });
              
              if (jsonData.questions?.length > 0) {
                return {
                  from: 'bot',
                  text: jsonData.questions.join('\n')
                };
              }
            }
          } catch (e) {
            console.log("Pas de données JSON dans la réponse");
          }
          
          return {
            from: 'bot',
            text: reply.text
          };
        });
        
        setMessages(prev => [...prev, ...botMessages]);
      }
    } catch (error) {
      console.error('Erreur API:', error);
      setMessages(prev => [...prev, {
        from: 'bot',
        text: `Erreur : ${error.message || 'Service indisponible'}`
      }]);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  // Rendu des messages
  const renderMessages = () => (
    <div className="messages-container">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`message ${msg.from === 'user' ? 'user-message' : 'bot-message'}`}
        >
          <div className="message-header">
            <strong>{msg.from === 'user' ? 'Vous' : 'Bot'}</strong>
          </div>
          <div className="message-content">{msg.text}</div>
        </div>
      ))}
      {isLoading && (
        <div className="message bot-message loading">
          <div className="message-header">
            <strong>Bot</strong>
          </div>
          <div className="message-content">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  // Rendu du panneau d'information
  const renderInfoPanel = () => (
    <div className="info-panel">
      <h3>Informations du voyage</h3>
      <div className="info-content">
        {Object.entries(voyage).map(([key, value]) => {
          if (!value || key === 'questions') return null;
          return (
            <div key={key} className="info-item">
              <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
              <p>{value}</p>
            </div>
          );
        })}
        
        {voyage.questions?.length > 0 && (
          <div className="questions-section">
            <h4>Questions en attente</h4>
            <ul>
              {voyage.questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="explore-container">
      <h1 className="explore-title">Exprimez vos envies de voyage</h1>
      
      <div className="explore-content">
        <div className="chat-section">
          {renderMessages()}

          <div className="input-section">
            <textarea
              rows={3}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Écrivez votre message ici..."
              className="chat-input"
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
            <button 
              className="send-button"
              onClick={handleSend}
              disabled={isLoading || !inputText.trim()}
            >
              Envoyer
            </button>
          </div>
        </div>

        {renderInfoPanel()}
      </div>
    </div>
  );
}

export default Explore;