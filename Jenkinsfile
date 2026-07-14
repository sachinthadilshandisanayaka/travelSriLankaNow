// ─────────────────────────────────────────────────────────────────────────────
// Unified deployment pipeline — handles personal site and all client projects
//
// Branch conventions:
//   release_v1_0              → personal site  → clients/PERSONAL/
//   PROJ001/release_v1.0      → client 1       → clients/PROJ001/
//   PROJ002/release_v1.0      → client 2       → clients/PROJ002/
//
// Per-project setup in Jenkins (one-time per project):
//   1. SSH key credential      ID: ssh-key-personal  / ssh-key-proj001  / ...
//   2. Secret file credential  ID: PERSONAL-secrets  / PROJ001-secrets  / ...
//      (fill clients/TEMPLATE/secrets.env.template and upload as Secret File)
//
// Adding a new client:
//   1. Copy clients/TEMPLATE/ → clients/PROJXXX/
//   2. Fill config.env (server IP, domain) and nginx.conf (their domain)
//   3. Add ssh-key-projXXX and PROJXXX-secrets credentials in Jenkins
//   4. Create branch PROJXXX/release_v1.0 and push → Jenkins picks it up
// ─────────────────────────────────────────────────────────────────────────────

pipeline {
    agent any

    stages {

        // ── 1. Detect project from branch name ────────────────────────────
        stage('Resolve Project') {
            steps {
                script {
                    def branch = env.BRANCH_NAME
                                 ?: env.GIT_BRANCH?.replaceFirst('origin/', '')
                                 ?: ''

                    String projectId

                    if (branch.contains('/')) {
                        // Client branch: "PROJ001/release_v1.0" → PROJ001
                        projectId = branch.split('/')[0].toUpperCase()
                    } else {
                        // Personal site: "release_v1_0" → PERSONAL
                        projectId = 'PERSONAL'
                    }

                    def configFile = "clients/${projectId}/config.env"
                    if (!fileExists(configFile)) {
                        error "No config found at '${configFile}'. " +
                              "Did you add this project to the clients/ folder?"
                    }

                    def cfg = readProperties file: configFile

                    env.PROJECT_ID      = projectId
                    env.DEPLOY_BRANCH   = branch
                    env.CLIENT_SERVER   = cfg.SERVER_IP
                    env.SSH_CRED_ID     = cfg.SSH_CRED_ID ?: "ssh-key-${projectId.toLowerCase()}"
                    env.SECRETS_CRED_ID = "${projectId}-secrets"
                    env.COMPOSE_PROJECT = projectId.toLowerCase()

                    echo """
╔══════════════════════════════════════════════════╗
  Project    : ${projectId}
  Branch     : ${branch}
  Server     : ${cfg.SERVER_IP}
  Domain     : ${cfg.DOMAIN}
  Compose NS : ${env.COMPOSE_PROJECT}
╚══════════════════════════════════════════════════╝"""
                }
            }
        }

        // ── 2. Pull the correct branch on the server ──────────────────────
        stage('Pull Code') {
            steps {
                sshagent([env.SSH_CRED_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.CLIENT_SERVER} '
                            if [ -d /root/travelSriLankaNow/.git ]; then
                                cd /root/travelSriLankaNow &&
                                git fetch --all &&
                                git checkout -B ${env.DEPLOY_BRANCH} --track origin/${env.DEPLOY_BRANCH} 2>/dev/null || true &&
                                git reset --hard origin/${env.DEPLOY_BRANCH}
                            else
                                git clone --branch ${env.DEPLOY_BRANCH} https://github.com/sachinthadilshan/travelSriLankaNow.git /root/travelSriLankaNow
                            fi
                        '
                    """
                }
            }
        }

        // ── 3. Push .env secrets and nginx config to the server ───────────
        stage('Push Config') {
            steps {
                withCredentials([file(credentialsId: env.SECRETS_CRED_ID, variable: 'SECRETS_FILE')]) {
                    sshagent([env.SSH_CRED_ID]) {
                        sh "ssh -o StrictHostKeyChecking=no ${env.CLIENT_SERVER} 'mkdir -p /root/travelSriLankaNow/nginx'"

                        // Push secrets as .env
                        sh "scp -o StrictHostKeyChecking=no \$SECRETS_FILE ${env.CLIENT_SERVER}:/root/travelSriLankaNow/.env"

                        // Push this project's nginx config
                        sh """
                            scp -o StrictHostKeyChecking=no \
                                clients/${env.PROJECT_ID}/nginx.conf \
                                ${env.CLIENT_SERVER}:/root/travelSriLankaNow/nginx/default.conf
                        """
                    }
                }
            }
        }

        // ── 4. Build and start containers ─────────────────────────────────
        stage('Build & Deploy') {
            steps {
                sshagent([env.SSH_CRED_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.CLIENT_SERVER} '
                            cd /root/travelSriLankaNow &&
                            COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT} docker compose down --remove-orphans &&
                            COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT} docker compose up -d --build
                        '
                    """
                }
            }
        }

        // ── 5. Health check ───────────────────────────────────────────────
        stage('Health Check') {
            steps {
                sh 'sleep 30'
                sshagent([env.SSH_CRED_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${env.CLIENT_SERVER} '
                            COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT} docker compose ps
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ [${env.PROJECT_ID}] Deployed successfully → ${env.CLIENT_SERVER}"
        }
        failure {
            echo "❌ [${env.PROJECT_ID}] Deployment failed"
            sshagent([env.SSH_CRED_ID]) {
                sh """
                    ssh -o StrictHostKeyChecking=no ${env.CLIENT_SERVER} '
                        cd /root/travelSriLankaNow &&
                        COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT} docker compose logs --tail=100
                    ' || true
                """
            }
        }
    }
}
