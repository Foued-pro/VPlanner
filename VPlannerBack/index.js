const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const FLASK_URL = process.env.FLASK_URL || "https://poko-sqpz.onrender.com";
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
  return `
Tu es un assistant expert en planification de voyages.

Ta mission est de construire un itinéraire personnalisé, mais uniquement à partir des informations fournies par l'utilisateur. Tu ne dois jamais inventer de données. Si une information nécessaire manque (comme la durée, le budget, ou les activités préférées), pose des questions à l'utilisateur pour les obtenir.

Tu dois répondre dans un format JSON structuré, avec les champs suivants :
- destination
- durée
- activités
- budget
- conseils
- questions

Si un champ ne peut pas encore être rempli, laisse-le vide et ajoute une ou plusieurs questions spécifiques dans le champ \`questions\` pour demander les informations manquantes à l'utilisateur.

Exemple de réponse :
\`\`\`json
{
  "destination": "Japon",
  "durée": "",
  "activités": "",
  "budget": "",
  "conseils": "",
  "questions": [
    "Combien de jours comptes-tu partir ?",
    "Quel est ton budget total ?",
    "Quels types d'activités aimes-tu (culture, nature, gastronomie, etc.) ?"
  ]
}
\`\`\`

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
    console.log('Tentative de connexion à:', `${FLASK_URL}/chat`);
    console.log('Données envoyées:', {
      message: message,
      currentVoyage: req.body.currentVoyage || {},
      context: req.body.context || {}
    });
    const flaskResponse = await axios.post(`${FLASK_URL}/chat`, {
      message: message,
      currentVoyage: req.body.currentVoyage || {},
      context: req.body.context || {}
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // Timeout de 10 secondes
    });

    if (flaskResponse.status === 200 && flaskResponse.data.reply) {
      return res.json({ 
        reply: [{ text: flaskResponse.data.reply }],
        data: flaskResponse.data.data || {}
      });
    } else {
      console.log("Erreur : réponse inattendue de Flask", flaskResponse.data);
      return res.status(500).json({ 
        error: "Erreur dans la réponse du serveur IA",
        details: "Format de réponse invalide"
      });
    }
  } catch (error) {
    console.error('Erreur API Flask:', error);
    
    // Gestion plus détaillée des erreurs
    if (error.response) {
      // Le serveur a répondu avec un code d'erreur
      return res.status(error.response.status).json({ 
        error: "Erreur du serveur IA",
        details: error.response.data || error.message
      });
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      return res.status(503).json({ 
        error: "Serveur IA inaccessible",
        details: "Le serveur ne répond pas"
      });
    } else {
      // Erreur lors de la configuration de la requête
      return res.status(500).json({ 
        error: "Erreur de configuration",
        details: error.message
      });
    }
  }  
});


app.get('/', (req, res) => {
  res.send("Serveur backend KyotsuVoyage opérationnel !");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
