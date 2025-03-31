# Étape de build
FROM node:18-alpine as build

WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie des fichiers de l'application
COPY public/ public/
COPY src/ src/

# Construction de l'application
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Copie des fichiers de build vers le répertoire de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copie d'une configuration personnalisée de Nginx si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposition du port 80
EXPOSE 80

# Commande par défaut pour démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]