FROM mysql:8.0

# Ajout des fichiers de configuration
COPY my.cnf /etc/mysql/conf.d/
COPY init.sql /docker-entrypoint-initdb.d/

# Variables d'environnement pour la configuration de MySQL
ENV MYSQL_ROOT_PASSWORD=root_password
ENV MYSQL_DATABASE=tododb
ENV MYSQL_USER=todouser
ENV MYSQL_PASSWORD=todopassword

EXPOSE 3306