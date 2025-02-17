const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Servir les fichiers statiques depuis "public"
app.use(express.static('public'));

// Servir les fichiers de `node_modules`
app.use('/modules', express.static(path.join(__dirname, 'node_modules')));

app.listen(port, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
});