const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'mysql-service', // Nom du service Kubernetes MySQL
  user: process.env.DB_USER || 'todouser',
  password: process.env.DB_PASSWORD || 'todopassword',
  database: process.env.DB_NAME || 'tododb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Création du pool de connexions
let pool;

// Fonction pour initialiser la connexion à la base de données
async function initializeDbConnection() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Connexion à la base de données établie');
    
    // Test de la connexion
    const connection = await pool.getConnection();
    console.log('✅ Test de connexion réussi');
    connection.release();
  } catch (error) {
    console.error('❌ Erreur lors de la connexion à la base de données:', error);
    // Réessayer après un délai
    setTimeout(initializeDbConnection, 5000);
  }
}

// Routes API

// Récupérer toutes les tâches
app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter une tâche
app.post('/api/tasks', async (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Le titre de la tâche est requis' });
  }
  
  try {
    const [result] = await pool.query('INSERT INTO tasks (title) VALUES (?)', [title]);
    const [newTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(newTask[0]);
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'une tâche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mettre à jour une tâche
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  
  try {
    let query = 'UPDATE tasks SET ';
    const values = [];
    
    if (title !== undefined) {
      query += 'title = ?, ';
      values.push(title);
    }
    
    if (completed !== undefined) {
      query += 'completed = ?, ';
      values.push(completed);
    }
    
    // Enlever la virgule finale
    query = query.slice(0, -2);
    
    query += ' WHERE id = ?';
    values.push(id);
    
    await pool.query(query, values);
    
    const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    
    if (updatedTask.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    
    res.json(updatedTask[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'une tâche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une tâche
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression d\'une tâche:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de vérification de l'état de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Le serveur API fonctionne correctement' });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`✅ Serveur API démarré sur le port ${port}`);
  
  // Initialiser la connexion à la base de données
  initializeDbConnection();
});