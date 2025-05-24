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
      const requestBody = {
        message: inputText,
        senderId: sessionId,
        currentVoyage: voyage,
        context: {
          lastMessage: inputText,
          previousMessages: messages.slice(-5).map(msg => ({
            role: msg.from === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        }
      };

      console.log('Envoi au backend:', JSON.stringify(requestBody, null, 2));

      const response = await fetch('/chat', {
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
        const botMessages = data.reply.map(reply => {
          console.log('Traitement de la réponse:', JSON.stringify(reply, null, 2));
          
          try {
            // Chercher d'abord les données JSON dans la réponse
            const jsonMatch = reply.text.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch) {
              const jsonData = JSON.parse(jsonMatch[1]);
              console.log('Données JSON extraites:', JSON.stringify(jsonData, null, 2));
              
              // Mettre à jour le panneau d'information
              setVoyage(prev => {
                const updatedVoyage = { ...prev };
                Object.entries(jsonData).forEach(([key, value]) => {
                  if (value) updatedVoyage[key] = value;
                });
                return updatedVoyage;
              });

              // Retourner uniquement les questions pour le chat
              if (jsonData.questions?.length > 0) {
                return {
                  from: 'bot',
                  text: jsonData.questions.join('\n')
                };
              }
            }

            // Si pas de JSON, chercher des informations structurées dans le texte
            const destinationMatch = reply.text.match(/destination[:\s]+([^\.]+)/i);
            const dureeMatch = reply.text.match(/durée[:\s]+([^\.]+)/i);
            const activitesMatch = reply.text.match(/activités[:\s]+([^\.]+)/i);
            const budgetMatch = reply.text.match(/budget[:\s]+([^\.]+)/i);

            if (destinationMatch || dureeMatch || activitesMatch || budgetMatch) {
              setVoyage(prev => ({
                ...prev,
                ...(destinationMatch && { destination: destinationMatch[1].trim() }),
                ...(dureeMatch && { durée: dureeMatch[1].trim() }),
                ...(activitesMatch && { activités: activitesMatch[1].trim() }),
                ...(budgetMatch && { budget: budgetMatch[1].trim() })
              }));
            }

            // Retourner le texte pour le chat
            return {
              from: 'bot',
              text: reply.text
            };
          } catch (e) {
            console.log("Erreur de traitement de la réponse:", e);
            return {
              from: 'bot',
              text: reply.text
            };
          }
        });
        
        setMessages(prev => [...prev, ...botMessages]);
      } else {
        console.log('Pas de réponse du bot');
        setMessages(prev => [...prev, {
          from: 'bot',
          text: 'Désolé, je n\'ai pas pu traiter votre demande. Veuillez réessayer.'
        }]);
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