# Cloud_tp2_Q1

## Question I
Dans ce projet, vous allez déployer une application web à deux niveaux avec une base de données et un frontend,
en utilisant des services, des déploiements et des volumes persistants.

### Étape 1: Prérequis
Assurez-vous d'avoir Minikube, Docker et kubectl installés.
1. Installer Docker: Kubernetes utilise Docker pour gérer les conteneurs.
    * MacOS
      * `brew install docker && docker --version`
2. Installer kubectl: C'est l'outil de ligne de commande pour interagir avec le cluster Kubernetes.
    * MacOS
      * `brew install kubectl && kubectl version --client`
3. Installer Minikube: C'est un outil qui permet de créer un cluster Kubernetes localement.
    * MacOS
      * `brew install minikube && minikube version`

### Étape 2: Déployer une base de données

1. Déploiement de la base de données:

    Créez un fichier mysql-deployment.yaml:
    
        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: mysql
        spec:
          replicas: 1
          selector:
            matchLabels:
              app: mysql
          template:
            metadata:
              labels:
                app: mysql
            spec:
              containers:
              - name: mysql
                image: mysql:5.7
                env:
                - name: MYSQL_ROOT_PASSWORD
                  value: "password"
                ports:
                - containerPort: 3306

* `minikube start`
* `kubectl cluster-info`
* `kubectl apply -f mysql-deployment.yaml`

2. Service MySQL:
    
    Créez un fichier mysql-service.yaml:
        
        apiVersion: v1
        kind: Service
        metadata:
          name: mysql
        spec:
          ports:
          - port: 3306
          selector:
            app: mysql

* `kubectl apply -f mysql-service.yaml`

### Étape 3: Déployer une application frontend
1. Déploiement du frontend:

    Créez un fichier frontend-deployment.yaml:

        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: frontend
        spec:
          replicas: 2
          selector:
            matchLabels:
              app: frontend
          template:
            metadata:
              labels:
                app: frontend
            spec:
              containers:
              - name: frontend
                image: nginx:latest # [VOTRE_IMAGE_FRONTEND]
                ports:
                - containerPort: 80

* `kubectl apply -f frontend-deployment.yaml`

2. Service Frontend:
    
    Créez un fichier frontend-service.yaml:

        apiVersion: v1
        kind: Service
        metadata:
          name: frontend
        spec:
          type: NodePort
          ports:
          - port: 80
            targetPort: 80
          selector:
            app: frontend

* `kubectl apply -f frontend-service.yaml`

### Étape 4: Volumes Persistants
Pour que la base de données conserve ses données même après un redémarrage, nous utiliserons unvolume
persistant.
1. Créer un PersistentVolumeClaim:
    
    Créez un fichier mysql-pvc.yaml:

        apiVersion: v1
        kind: PersistentVolumeClaim
        metadata:
          name: mysql-pvc
        spec:
          accessModes:
          - ReadWriteOnce
          resources:
            requests:
              storage: 1Gi

* `kubectl apply -f mysql-pvc.yaml`

2. Modifiez le fichier mysql-deployment.yaml pour ajouter le volume:

        apiVersion: apps/v1
        kind: Deployment
        metadata:
          name: mysql
        spec:
          replicas: 1
          selector:
            matchLabels:
              app: mysql
          template:
            metadata:
              labels:
                app: mysql
            spec:
              containers:
              - name: mysql
                image: mysql:5.7
                env:
                - name: MYSQL_ROOT_PASSWORD
                  value: "password"
                ports:
                - containerPort: 3306
                volumeMounts:
                - name: mysql-persistent-storage
                  mountPath: /var/lib/mysql
              volumes:
              - name: mysql-persistent-storage
                persistentVolumeClaim:
                  claimName: mysql-pvc

* `kubectl apply -f mysql-deployment.yaml`

### Étape 5: Accéder à l'application
Utilisez la commande suivante pour obtenir l'URL du frontend:
* `minikube service frontend --url`
Visitez l'URL pour accéder à votre application.

### Étape 6: Nettoyage
Supprimez les ressources créées:
* `kubectl delete -f frontend-service.yaml`
* `kubectl delete -f frontend-deployment.yaml`
* `kubectl delete -f mysql-service.yaml`
* `kubectl delete -f mysql-deployment.yaml`
* `kubectl delete -f mysql-pvc.yaml`

Arrêtez Minikube:
* `minikube stop`
