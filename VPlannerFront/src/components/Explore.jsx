import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [error, setError] = useState(null);

  // Références
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [sessionId] = useState(() => 'user_' + Math.random().toString(36).substr(2, 9));

  // Fonctions utilitaires
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Effets
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    props.addLog({ date: new Date(), message: "il a accédé à la page explore" });
    // Focus sur l'input au chargement
    inputRef.current?.focus();
  }, []);

  // Gestionnaire d'envoi de message
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    setError(null);
    const newMessage = { from: 'user', text: inputText };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const requestBody = {
        message: inputText,
        currentVoyage: voyage,
        context: {
          previousMessages: messages.map(msg => ({
            role: msg.from === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        }
      };

      console.log('Envoi au backend:', JSON.stringify(requestBody, null, 2));

      // Utiliser l'endpoint de notre backend Flask
      const response = await fetch('https://vplanner.onrender.com/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur réponse:', response.status, errorText);
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Réponse complète du backend:', JSON.stringify(data, null, 2));

      if (data.reply?.length > 0) {
        // Mettre à jour le panneau d'information avec les données structurées
        if (data.data) {
          setVoyage(prev => ({
            ...prev,
            ...(data.data.destination && { destination: data.data.destination }),
            ...(data.data.durée && { durée: data.data.durée }),
            ...(data.data.activités && { activités: data.data.activités }),
            ...(data.data.budget && { budget: data.data.budget }),
            ...(data.data.questions && { questions: data.data.questions })
          }));
        }

        // Ajouter la réponse du bot au chat
        setMessages(prev => [...prev, {
          from: 'bot',
          text: data.reply[0].text
        }]);
      } else {
        console.log('Pas de réponse du bot');
        setMessages(prev => [...prev, {
          from: 'bot',
          text: 'Désolé, je n\'ai pas pu traiter votre demande. Veuillez réessayer.'
        }]);
      }
    } catch (error) {
      console.error('Erreur API:', error);
      setError(error.message);
      setMessages(prev => [...prev, {
        from: 'bot',
        text: `Erreur : ${error.message || 'Service indisponible'}`
      }]);
    } finally {
      setIsLoading(false);
      setInputText('');
      inputRef.current?.focus();
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
          <div className="message-content">
            {msg.text.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
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
            {error && <div className="error-message">{error}</div>}
            <textarea
              ref={inputRef}
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
              {isLoading ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>

        {renderInfoPanel()}
      </div>
    </div>
  );
}

export default Explore;