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

  const handleSend = async () => {
    if (!inputText.trim()) return;

    setMessages(prev => [...prev, { from: 'user', text: inputText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText, senderId: 'user1' })
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();

      if (data.reply?.length > 0) {
        const botMessages = data.reply.map(reply => ({
          from: 'bot',
          text: reply.text || ''
        }));
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

  return (
    <div className="explore-container">
      <h2>Exprimez vos envies de voyage</h2>

      <div className="messages-container">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.from === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <strong>{msg.from === 'user' ? 'Vous' : 'Bot'} :</strong> {msg.text}
          </div>
        ))}
      </div>

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
    </div>
  );
};

export default Explore;