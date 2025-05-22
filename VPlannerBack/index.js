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
      scriptSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'https://vplanner.onrender.com'],
      fontSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'https://vplanner.onrender.com'],
      styleSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'https://vplanner.onrender.com'],
      imgSrc: ["'self'", 'https://kyotsuvoyage.vercel.app', 'https://vplanner.onrender.com'],
    }
  })
  
);

app.use(express.json());


function preparePrompt(userMessage) {
  return`
Tu es un assistant expert en planification de voyages. Tu dois aider l'utilisateur à organiser son voyage de manière efficace.
Analyse le message utilisateur. Si des informations importantes sont manquantes (comme la destination, la durée, ou le budget), pose une seule question claire et concise pour compléter les informations. Sinon, fournis un itinéraire personnalisé.
Formate ta réponse sous forme JSON avec ces champs :
{
  "reply": "Texte à afficher dans le chat",
  "data": {
    "destination": "...",
    "durée": "...",
    "activités": "...",
    "budget": "...",
    "conseils": "..."
  }
}

Voici le message utilisateur : ${userMessage}
`;
}

app.post('/chat', async (req, res) => {
  const message = req.body.message;
  
  if (!message) {
    return res.status(400).json({
      error: "Message manquant"
    });
  }

  const prompt = preparePrompt(message);

  try {
    // Appel au serveur Flask avec le prompt
    const flaskResponse = await axios.post(FLASK_URL, { prompt });

    if (flaskResponse.status === 200 && flaskResponse.data.reply) {
      return res.json({ 
        reply: [{ text: flaskResponse.data.reply }],
        data: flaskResponse.data.data || {}
      });
    } else {
      console.log("Erreur : réponse inattendue de Flask");
      return res.status(500).json({ error: "Erreur dans la réponse du serveur IA" });
    }
  } catch (error) {
    console.error('Erreur API Flask:', error);
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
