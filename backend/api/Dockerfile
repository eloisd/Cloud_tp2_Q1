FROM node:18-alpine

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY server.js ./

# Exposition du port
EXPOSE 3001

# Commande de démarrage
CMD ["node", "server.js"]