import React, { useState, useEffect } from 'react';
import '../App.css';

function Explore(props) {
  useEffect(() => {
    props.addLog({ date: new Date(), message: "il a accédé à la page explore" });
  }, []);

  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Bonjour ! Comment puis-je vous aider à planifier votre voyage ?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const [voyage, setVoyage] = useState({
    destination: "",
    durée: "",
    activités: "",
    budget: "",
    conseils: "",
    questions: []
  });

  const handleSend = async () => {
    if (!inputText.trim()) return;

    setMessages(prev => [...prev, { from: 'user', text: inputText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();

      if (data.reply?.length > 0) {
        const botMessages = data.reply.map(reply => ({
          from: 'bot',
          text: reply.text || ''
        }));
        setMessages(prev => [...prev, ...botMessages]);

        // Essayer de parser la réponse JSON du bot
        try {
          const jsonMatch = reply.text.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const jsonData = JSON.parse(jsonMatch[1]);
            setVoyage(prev => ({
              ...prev,
              ...jsonData
            }));
          }
        } catch (e) {
          console.log("Pas de données JSON dans la réponse");
        }
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

  return (
    <div className="explore-container">
      <h1 className="explore-title">Exprimez vos envies de voyage</h1>
      
      <div className="explore-content">
        <div className="chat-section">
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
          </div>

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

        <div className="info-panel">
          <h3>Informations du voyage</h3>
          <div className="info-content">
            {voyage.destination && (
              <div className="info-item">
                <h4>Destination</h4>
                <p>{voyage.destination}</p>
              </div>
            )}
            {voyage.durée && (
              <div className="info-item">
                <h4>Durée</h4>
                <p>{voyage.durée}</p>
              </div>
            )}
            {voyage.activités && (
              <div className="info-item">
                <h4>Activités</h4>
                <p>{voyage.activités}</p>
              </div>
            )}
            {voyage.budget && (
              <div className="info-item">
                <h4>Budget</h4>
                <p>{voyage.budget}</p>
              </div>
            )}
            {voyage.conseils && (
              <div className="info-item">
                <h4>Conseils</h4>
                <p>{voyage.conseils}</p>
              </div>
            )}
            
            {voyage.questions && voyage.questions.length > 0 && (
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
      </div>
    </div>
  );
};

export default Explore;