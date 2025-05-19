// index.js  nodemon index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config(); // charge les variables d'environnement depuis .env

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
  console.log("Requete reçue", req.body);
  const message = req.body.message;

  try {
    const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
      sender: req.body.senderId,
      message: message
    });
    console.log("Réponse de Rasa", response.data);
    res.json({replies: response.data});
  } catch (error) {
    console.error('Erreur lors de la requête à Rasa:', error.message);
    res.status(500).json({error: error.message});
  }
});


