import React, { useState, useEffect } from 'react';


function Explore(props) {   

  useEffect(() => {
    props.addLog({date: new Date(), message: "il a accédé à la page explore"});
  }, []);


  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Bonjour ! Comment puis-je vous aider à planifier votre voyage ?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    console.log("0 - Envoi du message au backend :", inputText);
    if (!inputText.trim()) return;

    // Ajout immédiat du message utilisateur
    setMessages(prev => [...prev, { from: 'user', text: inputText }]);
    setIsLoading(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText, senderId: 'user1' })
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      console.log("6 - Réponse brute reçue du backend");

      const data = await response.json();
      console.log("7 - Données JSON analysées");

      // Validation de la réponse
      if (data.replies?.length > 0) {
        const botMessages = data.replies.map(reply => ({
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
  console.log('Envoi au backend: /chat');


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
              color: msg.from === 'user' ? '#1e90ff' : '#2e8b57',
              margin: '10px 0',
              wordBreak: 'break-word'
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
        style={{ 
          width: '100%', 
          padding: '0.5rem', 
          fontSize: '1rem',
          marginBottom: '0.5rem',
          resize: 'vertical'
        }}
        onKeyDown={e => { 
          if (e.key === 'Enter' && !e.shiftKey && !isLoading) { 
            e.preventDefault(); 
            handleSend(); 
          } 
        }}
        disabled={isLoading}
      />

      <button 
        onClick={handleSend} 
        style={{ 
          marginTop: 10,
          padding: '0.5rem 1rem',
          backgroundColor: isLoading ? '#cccccc' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Envoi en cours...' : 'Envoyer'}
      </button>
    </div>
  );
};

export default Explore;