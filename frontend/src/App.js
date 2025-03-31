import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // L'URL de l'API backend (à ajuster selon vos paramètres k8s)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des tâches:', err);
      setError('Impossible de récupérer les tâches. Veuillez vérifier votre connexion à la base de données.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/tasks`, { title: newTask });
      setTasks([...tasks, response.data]);
      setNewTask('');
    } catch (err) {
      console.error('Erreur lors de l\'ajout d\'une tâche:', err);
      setError('Impossible d\'ajouter la tâche.');
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      await axios.put(`${API_URL}/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
    } catch (err) {
      console.error('Erreur lors de la mise à jour d\'une tâche:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression d\'une tâche:', err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo List Docker & Kubernetes Test</h1>
      </header>
      <main>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={addTask} className="task-form">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Ajouter une nouvelle tâche..."
            className="task-input"
          />
          <button type="submit" className="add-button">Ajouter</button>
        </form>
        
        {isLoading ? (
          <p>Chargement des tâches...</p>
        ) : (
          <ul className="task-list">
            {tasks.length === 0 ? (
              <li className="empty-message">Aucune tâche pour le moment</li>
            ) : (
              tasks.map(task => (
                <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <span onClick={() => toggleComplete(task.id, task.completed)}>
                    {task.title}
                  </span>
                  <button onClick={() => deleteTask(task.id)} className="delete-button">
                    Supprimer
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </main>
      <footer>
        <p>Mini-projet Docker & Kubernetes</p>
      </footer>
    </div>
  );
}

export default App;