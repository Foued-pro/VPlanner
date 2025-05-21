const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://kyotsuvoyage.vercel.app', 'http://localhost:3000']
}));

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'http://localhost:3000', 'https://vplanner.onrender.com'],
      scriptSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'http://localhost:3000', 'https://vplanner.onrender.com'],
      fontSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'http://localhost:3000', 'https://vplanner.onrender.com'],
      imgSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'http://localhost:3000', 'https://vplanner.onrender.com'],
    },
  })
);

app.use(express.json());

function isTravelRelated(text) {
  const keywords = ["voyage", "itinéraire", "destination", "vol", "hôtel", "budget", "activité", "tourisme"];
  return keywords.some(k => text.toLowerCase().includes(k));
}

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
  if (!isTravelRelated(message)) {
    return res.json({
      error: "Je ne peux répondre qu’à des questions liées au voyage."
    });
  }

  const prompt = preparePrompt(message);

  try {
    // Exemple d'appel à l'API HuggingFace Inference
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',  
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` }
      }
    );

    // Ici on suppose que la réponse est dans response.data[0].generated_text ou autre selon l'API
    const aiResponse = response.data[0]?.generated_text || "Pas de réponse";

    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Erreur API IA:', error.message);
    res.status(500).json({ error: 'Erreur lors de la requête au modèle IA' });
  }
});

app.get('/', (req, res) => {
  res.send("Serveur backend KyotsuVoyage opérationnel !");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
