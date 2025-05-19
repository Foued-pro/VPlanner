// index.js  nodemon index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Je suis Hamed !');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const axios = require('axios');

app.post('/chat', async (req, res) => {
  const {senderId, message} = req.body;
  if(!senderId || !message) {
    return res.status(400).json({error: 'Il faut fournir un senderId et un message'});
  }

  try {
    const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
      sender: senderId,
      message: message
    });
    res.json({replies: response.data});
  } catch (error) {
    console.error('Erreur lors de la requête à Rasa:', error.message);
    res.status(500).json({error: 'Erreur lors de la requête à Rasa'});
  }
});


