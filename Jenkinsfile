pipeline {
    agent any

    environment {
        PROJECT_DIR = '/root/travelSriLankaNow'
    }

    stages {
        stage('Pull Latest Code') {
            steps {
                sh "cd ${PROJECT_DIR} && git stash && git pull origin release_v1_0"
            }
        }

        stage('Build & Deploy') {
            steps {
                sh "cd ${PROJECT_DIR} && docker compose down"
                sh "cd ${PROJECT_DIR} && docker compose up -d --build"
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 20'
                sh "cd ${PROJECT_DIR} && docker compose ps"
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
            sh "cd ${PROJECT_DIR} && docker compose logs --tail=50"
        }
    }
}
