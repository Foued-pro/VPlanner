// index.js  nodemon index.js
const express = require('express');  // importe le module express mais cest du http
const cors = require('cors'); // pour relier le front et le back
const dotenv = require('dotenv'); // pour charger les variables d'environnement
const axios = require('axios'); // pour les requêtes HTTP plus simple que fetch

dotenv.config(); // charge les variables d'environnement 

const app = express(); // crée une instance de l'application express
const PORT = process.env.PORT || 3000; // définit le port de l'application soit le port 3000 ou le port définit dans le .env

app.use(cors({
  origin: ['https://kyotsuvoyage.vercel.app', 'http://localhost:3000'] // permet de relier le front et le back
}

)); // permet de relier le front et le back
app.use(express.json()); // permet de parser les requêtes JSON

app.get('/', (req, res) => {
  res.send('Tu es a la page d\'accueil !'); // envoie une réponse à la requête GET
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // le serveur est en écoute sur les ports définit dans le .env
});


app.post('/chat', async (req, res) => { // quand le front envoie une requête POST sur le chemin /chat
  console.log("Requete reçue", req.body); // affiche la requête reçue
  const message = req.body.message; // récupère le message envoyé par le front

  const RASA_URL = process.env.RASA_URL ;

  try {
    const response = await axios.post(`${RASA_URL}/webhooks/rest/webhook`, {  // envoie la requête à Rasa
      sender: req.body.senderId, // envoie l'id de l'expéditeur
      message: message // envoie le message
    });
    console.log("Réponse de Rasa", response.data); // affiche la réponse de Rasa
    res.json({replies: response.data}); // envoie la réponse de Rasa au front
  } catch (error) {
    console.error('Erreur lors de la requête à Rasa:', error.message);
    res.status(500).json({error: error.message});
  }
});


