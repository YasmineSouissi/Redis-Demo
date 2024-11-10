const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Redis = require("redis");

const redisClient = Redis.createClient({ url: 'redis://127.0.0.1:6379' });

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("Connecté à Redis avec succès !");
    } catch (error) {
        console.error("Erreur de connexion à Redis :", error);
    }
}
connectRedis();

const DEFAULT_EXPIRATION = 3600; // Durée d'expiration du cache en secondes

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Activez CORS

// Route pour récupérer toutes les photos
app.get("/photos", async (req, res) => {
    try {
        const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos");
        console.log("Données reçues de l'API ");

        if (data.length === 0) {
            return res.status(404).json({ error: "Aucune photo trouvée." });
        }

        // Mettez les données en cache dans Redis
        redisClient.setEx('photos', DEFAULT_EXPIRATION, JSON.stringify(data));

        // Envoyez les données en réponse
        res.json(data);
    } catch (error) {
        console.error("Erreur lors de la récupération des photos :", error);
        res.status(500).json({ error: 'Erreur lors de la récupération des photos.' });
    }
});

// Route pour récupérer les photos à partir du cache Redis
app.get("/cached-photos", async (req, res) => {
    redisClient.get('photos', async (error, photos) => {
        if (photos != null) {
            console.log("Cache hit");
            return res.json(JSON.parse(photos));
        } else {
            console.log("Cache miss");
            const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos");
            redisClient.setEx('photos', DEFAULT_EXPIRATION, JSON.stringify(data));
            res.json(data);
        }
    });
});

// Démarrage du serveur sur le port 4000
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
