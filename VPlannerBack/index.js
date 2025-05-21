const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const FLASK_URL = process.env.FLASK_URL || "http://localhost:5000/api/chat";
app.use(cors());

//app.use(cors({
//  origin: ['https://kyotsuvoyage.vercel.app', 'http://localhost:3000']
//}));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'http://localhost:3000', 'https://vplanner.onrender.com'],
      fontSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'http://localhost:3000', 'https://vplanner.onrender.com'],
      styleSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'http://localhost:3000', 'https://vplanner.onrender.com'],
      imgSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'http://localhost:3000', 'https://vplanner.onrender.com'],
    }
  })
  
);

app.use(express.json());


function preparePrompt(userMessage) {
  return `
Tu es un assistant expert en planification de voyages.
Tu dois uniquement aider à créer des itinéraires, proposer des activités, des budgets, et des conseils de voyage.
Ne réponds pas aux questions hors sujet.
Format ta réponse au format JSON avec ces champs : destination, durée, activités, budget, conseils.

Message utilisateur: ${userMessage}
  `;
}

app.post('/chat', async (req, res) => {
  console.log("1 - Message reçu du frontend :", req.body.message);
  const message = req.body.message;
  if (!(message)) {
    return res.status(400).json({
      error: "Message manquant"
    });
  }

  const prompt = preparePrompt(message);
  console.log("3 - Prompt préparé pour Flask :", prompt);


  try {
    // Appel au serveur Flask avec le prompt
    const flaskResponse = await axios.post(process.env.FLASK_URL + '/api/chat', { prompt });
    console.log("4 - Réponse reçue de Flask :", flaskResponse.data);

    const replyText = flaskResponse.data.reply || "Pas de réponse";
    console.log("5 - Réponse prête à envoyer au frontend :", replyText);

    if (flaskResponse.status === 200 && flaskResponse.data.reply) {
      return res.json({ reply: [{ text: flaskResponse.data.reply }] });
    } else {
      console.log("6 - Erreur : réponse inattendue de Flask");
      return res.status(500).json({ error: "Erreur dans la réponse du serveur IA" });
    }
  } catch (error) {
    console.error('Erreur API Flask:', error); // ← pas juste .message
    return res.status(500).json({ 
      error: "Erreur lors de la communication avec le serveur IA",
      details: error.message
    });
  }  
});

app.get('/', (req, res) => {
  res.send("Serveur backend KyotsuVoyage opérationnel !");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
