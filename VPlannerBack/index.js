const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const FLASK_URL = process.env.FLASK_URL || "http://localhost:5000/api/chat";

// CORS simple (ou remets la version filtrée si tu préfères)
app.use(cors());

// Si tu préfères restreindre l'origine, décommente et ajuste ça :
// app.use(cors({
//   origin: ['https://kyotsuvoyage.vercel.app', 'http://localhost:3000']
// }));

// Sécurité avec helmet
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
  const message = req.body.message;
  console.log("1 - Message reçu du frontend :", message);

  if (!message) {
    return res.status(400).json({ error: "Message manquant" });
  }

  const prompt = preparePrompt(message);
  console.log("3 - Prompt préparé pour Flask :", prompt);

  try {
    const flaskResponse = await axios.post(FLASK_URL, { prompt });
    console.log("4 - Réponse reçue de Flask :", flaskResponse.data);

    const replyText = flaskResponse.data.reply || "Pas de réponse";
    console.log("5 - Réponse brute :", replyText);

    let infos = {};
    try {
      const match = replyText.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (match && match[1]) {
        infos = JSON.parse(match[1]);
      }
    } catch (e) {
      console.error("Erreur de parsing du JSON depuis la réponse bot:", e.message);
      infos = {}; // vide si parsing échoue
    }

    return res.json({
      reply: [{ text: replyText }],
      info: infos
    });

  } catch (error) {
    console.error("Erreur API Flask:", error);
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
