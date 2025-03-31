# Guide de mise en place

### 1. **Construire les images docker**
1. Construisez l'image MySQL :
  * ```bash
    cd backend
    docker build -t todo-mysql:latest .
    cd ..
    ```
2. Construisez l'image API :
  * ```bash
    cd backend/api
    docker build -t todo-api:latest .
    cd ../..
    ```
3. Construisez l'image Frontend :
  * ```bash
    cd frontend
    docker build -t todo-frontend:latest .
    cd ..
    ```

### 2. **Déploiement de kubernetes**
1. Démarrez votre cluster Kubernetes local:
  * ```bash
    minikube start
    ```
2. Chargez vos images dans Minikube :
  * ```bash
    minikube image load todo-mysql:latest
    minikube image load todo-api:latest
    minikube image load todo-frontend:latest
    ```
3. Créez un namespace pour notre application :
  * ```bash
    kubectl create namespace todo-app
    ```
4. Déployez les composants dans l'ordre :
  * ```bash
    kubectl apply -f k8s/mysql-pvc.yaml -n todo-app
    kubectl apply -f k8s/mysql-deployment.yaml -n todo-app
    kubectl apply -f k8s/mysql-service.yaml -n todo-app
    kubectl apply -f k8s/api-deployment.yaml -n todo-app
    kubectl apply -f k8s/frontend-deployment.yaml -n todo-app
    kubectl apply -f k8s/frontend-service.yaml -n todo-app
    ```
5. Verifier la communication directe entre le navigateur et l'API
  * ```bash
    kubectl port-forward service/todo-api-service 3001:3001 -n todo-app
    ```

### 3. Accédez à l'application via l'URL fournie par :
* ```bash
  minikube service todo-frontend-service -n todo-app --url
  ```

### 4. Vérifications
1. Vérifiez que tous les pods fonctionnent correctement :
  * ```bash
    kubectl get pods -n todo-app
    ```
2. Vérifiez les services :
3. Vérifiez le volume persistant :
4. Consultez les logs du pod MySQL pour vérifier la connexion :

### 5. Test de la persistance des données
* ```bash
  kubectl delete pod -n todo-app -l app=todo,tier=backend
  ```


### 6. Nettoyage
* ```bash
  kubectl delete namespace todo-app
  ```

# Rapport de mise en place d'une application Todo List avec Docker et Kubernetes

## Introduction

Ce rapport détaille l'implémentation d'un mini-projet de déploiement d'une application Todo List utilisant Docker et Kubernetes. Le projet a été conçu pour démontrer l'utilisation des conteneurs, des services Kubernetes et des volumes persistants dans un environnement d'application à trois niveaux.

## Architecture du système

L'application Todo List a été développée selon une architecture à trois niveaux :

1. **Frontend** : Interface utilisateur développée avec React
2. **Backend API** : Service API REST développé avec Node.js/Express
3. **Base de données** : Instance MySQL pour le stockage persistant des données

## Composants déployés

### 1. Base de données (MySQL)

- **Image Docker** : Basée sur l'image officielle MySQL 8.0
- **Configuration** : Utilisation de fichiers de configuration personnalisés et de scripts d'initialisation
- **Persistance des données** : Un volume persistant (PVC) a été configuré pour garantir que les données restent intactes même après le redémarrage des pods
- **Service Kubernetes** : Le service `mysql-service` permet aux autres composants du cluster de communiquer avec la base de données

### 2. API Backend (Node.js)

- **Fonctionnalités** : API REST complète pour la gestion des tâches (création, lecture, mise à jour, suppression)
- **Communication avec la base de données** : Utilisation du module mysql2 pour établir une connexion avec la base de données MySQL
- **Service Kubernetes** : Le service `todo-api-service` en mode ClusterIP expose l'API aux autres services dans le cluster

### 3. Frontend (React)

- **Interface utilisateur** : Application React simple permettant d'ajouter, supprimer et marquer des tâches comme terminées
- **Communication avec l'API** : Utilisation d'Axios pour les requêtes HTTP
- **Service Kubernetes** : Un service NodePort (`todo-frontend-service`) expose l'interface utilisateur à l'extérieur du cluster sur le port 30080

## Déploiement sur Kubernetes

Le déploiement a été réalisé suivant ces étapes :

1. **Construction des images Docker** pour chaque composant
2. **Chargement des images** dans l'environnement Minikube
3. **Déploiement des ressources Kubernetes** dans l'ordre suivant :
   - Volume persistant pour MySQL
   - Déploiement et service MySQL
   - Déploiement et service API
   - Déploiement et service Frontend

## Défis rencontrés et solutions

### 1. Problèmes de construction des images Docker

- **Problème** : Erreur "input/output error" lors de la construction de l'image MySQL
- **Solution** : Redémarrage de Docker et nettoyage des ressources inutilisées

### 2. Structure des répertoires pour le frontend

- **Problème** : Erreur lors de la construction de l'image frontend en raison de l'absence des répertoires `public/` et `src/`
- **Solution** : Création manuelle de la structure de répertoires et organisation correcte des fichiers

### 3. Connectivité entre services

- **Problème** : Difficulté de communication entre le frontend et l'API
- **Solution** : Utilisation de `kubectl port-forward` pour exposer l'API localement, permettant ainsi au navigateur d'accéder directement au service API

### 4. Persistance des données

- **Démonstration réussie** : Ajout et suppression de tâches, avec conservation des données après redémarrage des pods, démontrant l'efficacité du volume persistant

## Utilisation du service NodePort

Le service NodePort a été utilisé pour exposer l'application frontend à l'extérieur du cluster Kubernetes. Voici comment ce type de service fonctionne :

- Un port est ouvert sur tous les nœuds du cluster (dans notre cas, le port 30080)
- Toute requête arrivant sur ce port est redirigée vers le service correspondant
- Le service achemine ensuite le trafic vers les pods appropriés selon le sélecteur défini

Cette approche est particulièrement adaptée aux environnements de développement et de test, comme celui-ci, où une exposition simple des services est suffisante sans nécessiter la complexité d'un Ingress ou d'un LoadBalancer.

## Tests effectués

Les tests suivants ont été effectués avec succès :

1. **Connexion à l'application** via l'URL fournie par Minikube
2. **Création de nouvelles tâches** dans l'interface utilisateur
3. **Marquage des tâches comme terminées** (comportement barré)
4. **Suppression de tâches**
5. **Test de persistance** : redémarrage des pods et vérification que les données sont conservées

## Conclusion

Ce mini-projet a permis de mettre en œuvre avec succès les concepts suivants :

1. **Conteneurisation d'applications** avec Docker
2. **Orchestration de conteneurs** avec Kubernetes
3. **Persistance des données** à l'aide de volumes Kubernetes
4. **Communication entre services** au sein d'un cluster Kubernetes
5. **Exposition de services** à l'extérieur du cluster

Les captures d'écran montrent clairement le fonctionnement de l'application, avec la capacité d'ajouter, marquer comme terminées et supprimer des tâches, démontrant ainsi la réussite du déploiement.

# Réponses aux questions

## 2. Explication du type NodePort avec un exemple

Le type NodePort est l'une des méthodes d'exposition de services dans Kubernetes.

### Qu'est-ce qu'un NodePort ?

Un NodePort est un type de service Kubernetes qui expose une application sur un port spécifique sur tous les nœuds du cluster. Cela permet d'accéder au service depuis l'extérieur du cluster.

### Comment fonctionne le NodePort ?

Lorsque vous créez un service de type NodePort :

1. Kubernetes ouvre un port spécifique (dans la plage par défaut 30000-32767) sur tous les nœuds du cluster
2. Tout trafic envoyé à ce port est redirigé vers le service correspondant
3. Le service achemine ensuite le trafic vers les pods appropriés

### Notre exemple dans l'application Todo

Dans notre application, nous avons créé un service NodePort pour le frontend :

```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend-service
  labels:
    app: todo
    tier: frontend
spec:
  type: NodePort
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080  # Port accessible depuis l'extérieur
  selector:
    app: todo
    tier: frontend
```

Explication des champs importants :
- `type: NodePort` : Définit le type de service
- `port: 80` : Le port interne du service (utilisé par d'autres services à l'intérieur du cluster)
- `targetPort: 80` : Le port sur lequel l'application s'exécute dans le pod (port Nginx dans notre cas)
- `nodePort: 30080` : Le port exposé sur les nœuds du cluster (accessible depuis l'extérieur)

### Accès à l'application via NodePort

Avec Minikube, vous pouvez obtenir l'URL d'accès avec :

```bash
minikube service todo-frontend-service -n todo-app --url
```

Cette commande retourne une URL comme `http://192.168.64.2:30080` qui pointe vers le service NodePort et vous permet d'accéder à l'application dans votre navigateur.

### Avantages et inconvénients du NodePort

**Avantages :**
- Simple à configurer
- Fonctionne dans presque tous les environnements Kubernetes
- Parfait pour les environnements de développement et de test

**Inconvénients :**
- Limite de ports disponibles (30000-32767)
- Moins sécurisé pour les environnements de production
- Ne fournit pas de load balancing externe avancé

Dans un environnement de production, on utiliserait plutôt un service de type LoadBalancer ou un Ingress Controller pour exposer les applications, mais pour notre test Docker/Kubernetes, le NodePort est parfaitement adapté et démontre comment exposer un service.