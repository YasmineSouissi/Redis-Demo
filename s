const express = require("express");
const axios = require("axios");
const cors = require("cors");

// Créez une instance de l'application Express
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Activez CORS

// Route pour récupérer toutes les photos
app.get("/photos", async (req, res) => {
    try {
        // Faites une requête GET à l'API pour récupérer les photos
        const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos");
        console.log("Données reçues de l'API :", data);

        if (data.length === 0) {
            return res.status(404).json({ error: "Aucune photo trouvée." });
        }

        // Renvoie les données des photos
        res.json(data);
    } catch (error) {
        console.error("Erreur lors de la récupération des photos :", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des photos.' });
    }
});

// Démarrage du serveur sur le port 4000
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
