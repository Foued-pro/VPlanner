from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json

app = Flask(__name__)
CORS(app)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
}

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    current_voyage = data.get("currentVoyage", {})
    context = data.get("context", {})
    
    # Construire l'historique des messages
    messages = []
    
    # Ajouter le system prompt
    system_prompt = f"""Tu es un assistant de voyage intelligent. Ton rôle est d'aider l'utilisateur à planifier un voyage personnalisé.

Informations actuelles du voyage :
- Destination: {current_voyage.get("destination", "non spécifiée")}
- Durée: {current_voyage.get("durée", "non spécifiée")}
- Activités: {current_voyage.get("activités", "non spécifiées")}
- Budget: {current_voyage.get("budget", "non spécifié")}

Règles importantes :
1. Utilise les informations déjà fournies pour poser des questions pertinentes
2. Ne demande pas d'informations déjà fournies
3. Pose une seule question à la fois
4. Si l'utilisateur fournit plusieurs informations, traite-les toutes
5. Réponds de façon naturelle et conversationnelle
6. Confirme les informations reçues avant de poser la question suivante

Format de réponse :
Pour les informations structurées, utilise ce format JSON :
```json
{{
    "destination": "destination si fournie",
    "durée": "durée si fournie",
    "activités": "activités si fournies",
    "budget": "budget si fourni",
    "questions": ["question suivante à poser"]
}}
```"""

    messages.append({
        "role": "system",
        "content": system_prompt
    })

    # Ajouter l'historique des messages
    if context.get("previousMessages"):
        messages.extend(context["previousMessages"])

    # Ajouter le message actuel
    messages.append({
        "role": "user",
        "content": message
    })

    payload = {
        "model": "deepseek/deepseek-chat",
        "messages": messages,
        "temperature": 0.7
    }

    print("Requête envoyée à OpenRouter:", json.dumps(payload, indent=2))

    response = requests.post(OPENROUTER_URL, headers=headers, json=payload)
    print("STATUS OpenRouter:", response.status_code)
    print("Réponse OpenRouter:", response.text)

    if response.status_code == 200:
        output = response.json()
        reply = output["choices"][0]["message"]["content"]
        
        # Essayer d'extraire les données JSON de la réponse
        try:
            json_match = reply.split("```json")[1].split("```")[0].strip()
            data = json.loads(json_match)
            return jsonify({
                "reply": [{"text": reply}],
                "data": data
            })
        except:
            return jsonify({
                "reply": [{"text": reply}],
                "data": {}
            })
    else:
        return jsonify({
            "error": "API OpenRouter error",
            "details": response.text
        }), response.status_code

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000) 