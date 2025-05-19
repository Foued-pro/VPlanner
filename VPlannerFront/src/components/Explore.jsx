import React, { useState } from 'react';
import { useState } from 'react';

const Explore = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Bonjour ! Comment puis-je vous aider à planifier votre voyage ?' }
  ]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Ajoute le message utilisateur
    setMessages(prev => [...prev, { from: 'user', text: inputText }]);
    addLog({ type: 'user_message', content: inputText });

    try {
      const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText, senderId: 'user1' }) // adapte senderId si besoin
      });

      const data = await response.json();
      addLog({ type: 'server_response', content: data });


      // data.replies est un tableau d’objets réponses, on ajoute toutes les réponses bot
      const botMessages = data.replies.map(reply => ({
        from: 'bot',
        text: reply.text || ''
      }));

      setMessages(prev => [...prev, ...botMessages]);

    } catch (error) {
      const errorMsg = "Erreur serveur, veuillez réessayer.";
      setMessages(prev => [...prev, { from: 'bot', text: errorMsg }]);
      addLog({ type: 'error', content: error.message });
    }

    setInputText('');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 600, margin: 'auto' }}>
      <h2>Exprimez vos envies de voyage</h2>

      <div style={{
        border: '1px solid #ccc',
        padding: 10,
        minHeight: 300,
        overflowY: 'auto',
        marginBottom: 20
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.from === 'user' ? 'right' : 'left',
              color: msg.from === 'user' ? 'blue' : 'green',
              margin: '10px 0'
            }}
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
        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
      />
      <button onClick={handleSend} style={{ marginTop: 10 }}>
        Envoyer
      </button>
    </div>
  );
};

export default Explore;
