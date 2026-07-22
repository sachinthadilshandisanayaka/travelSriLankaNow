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

    environment {
        // ServerAliveInterval keeps the TCP connection alive through silent Docker
        // operations (image layer removal, large builds) that produce no output
        // for tens of seconds and would otherwise cause Jenkins to declare the
        // durable task dead (JENKINS-48300 / exit code -1).
        SSH_OPTS = '-o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=10'
    }

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
                    env.NGINX_CONF_FILE = cfg.NGINX_CONF ?: 'nginx'

                    // Build ALLOWED_ORIGINS and MINIO_PUBLIC_URL from DOMAIN — not secrets
                    def domain = cfg.DOMAIN ?: ''
                    env.ALLOWED_ORIGINS    = domain ? "https://${domain},https://www.${domain}" : 'http://localhost:4200'
                    env.MINIO_PUBLIC_URL   = domain ? "https://${domain}/storage" : 'http://localhost:9000'

                    // Branding — injected into index.html OG meta at build time
                    env.DOMAIN            = domain
                    env.SITE_NAME         = cfg.SITE_NAME ?: 'Travel Sri Lanka Now'
                    env.SITE_TAGLINE      = cfg.SITE_TAGLINE ?: 'Explore Beautiful Sri Lanka'
                    env.SITE_DESCRIPTION  = cfg.SITE_DESCRIPTION ?: 'Discover the best travel destinations in Sri Lanka.'

                    // Theme & favicon — read by generate-theme.sh inside the frontend container at startup
                    env.THEME_PRESET      = cfg.THEME_PRESET ?: 'navy'
                    env.FAVICON_URL       = cfg.FAVICON_URL  ?: ''

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
                withCredentials([usernamePassword(credentialsId: 'github-creds', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
                    sshagent([env.SSH_CRED_ID]) {
                        sh """
                            ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} '
                                if [ -d /root/travelSriLankaNow/.git ]; then
                                    cd /root/travelSriLankaNow &&
                                    git fetch --all &&
                                    git checkout -B ${env.DEPLOY_BRANCH} --track origin/${env.DEPLOY_BRANCH} 2>/dev/null || true &&
                                    git reset --hard origin/${env.DEPLOY_BRANCH}
                                else
                                    rm -rf /root/travelSriLankaNow &&
                                    git clone --branch ${env.DEPLOY_BRANCH} https://${GH_USER}:${GH_TOKEN}@github.com/sachinthadilshan/travelSriLankaNow.git /root/travelSriLankaNow
                                fi
                            '
                        """
                    }
                }
            }
        }

        // ── 3. Push .env secrets and nginx config to the server ───────────
        stage('Push Config') {
            steps {
                withCredentials([file(credentialsId: env.SECRETS_CRED_ID, variable: 'SECRETS_FILE')]) {
                    sshagent([env.SSH_CRED_ID]) {
                        sh "ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} 'mkdir -p /root/travelSriLankaNow/nginx'"

                        // Push secrets as .env then append non-secret derived vars
                        sh "scp ${env.SSH_OPTS} \$SECRETS_FILE ${env.CLIENT_SERVER}:/root/travelSriLankaNow/.env"
                        sh "ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} 'echo \"ALLOWED_ORIGINS=${env.ALLOWED_ORIGINS}\" >> /root/travelSriLankaNow/.env'"
                        sh "ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} 'echo \"MINIO_PUBLIC_URL=${env.MINIO_PUBLIC_URL}\" >> /root/travelSriLankaNow/.env'"
                        sh "ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} 'echo \"THEME_PRESET=${env.THEME_PRESET}\" >> /root/travelSriLankaNow/.env'"
                        sh "ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} 'echo \"FAVICON_URL=${env.FAVICON_URL}\" >> /root/travelSriLankaNow/.env'"

                        // Push this project's nginx config (NGINX_CONF in config.env selects the file)
                        sh """
                            scp ${env.SSH_OPTS} \
                                clients/${env.PROJECT_ID}/${env.NGINX_CONF_FILE}.conf \
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
                        ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} '
                            cd /root/travelSriLankaNow

                            echo "==> [1/4] Patching client branding in index.html..."
                            sed -i \
                                -e "s|__SITE_NAME__|${env.SITE_NAME}|g" \
                                -e "s|__DOMAIN__|${env.DOMAIN}|g" \
                                -e "s|__SITE_TAGLINE__|${env.SITE_TAGLINE}|g" \
                                -e "s|__SITE_DESCRIPTION__|${env.SITE_DESCRIPTION}|g" \
                                travelSrilankaNow/src/index.html

                            echo "==> [2/4] Stopping compose-tracked containers..."
                            COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT} docker compose down --remove-orphans --timeout 60 2>&1 || true

                            echo "==> [3/4] Force-removing any leftover containers..."
                            docker ps -a --format "{{.Names}}" | grep "^${env.COMPOSE_PROJECT}-" | xargs -r docker rm -f 2>/dev/null || true

                            echo "==> [4/4] Building and starting containers..."
                            COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT} docker compose up -d --build --force-recreate 2>&1

                            echo "==> Build & Deploy complete."
                        '
                    """
                }
            }
        }

        // ── 5. Fix stored media URLs ──────────────────────────────────────
        // Replaces any http://localhost:9000/ URLs left in the DB (uploaded
        // before MINIO_PUBLIC_URL was set) with the correct public prefix.
        // Idempotent — rows already using the correct URL are untouched.
        stage('Fix DB URLs') {
            steps {
                script {
                    writeFile file: 'fix-urls.sql', text: """\
DO \$MIGRATE\$
DECLARE
  old_prefix TEXT := 'http://localhost:9000/';
  new_prefix TEXT := '${env.MINIO_PUBLIC_URL}/';
BEGIN
  UPDATE companies                SET logo_url           = REPLACE(logo_url,           old_prefix, new_prefix) WHERE logo_url           LIKE 'http://localhost:9000/%';
  UPDATE companies                SET signature_url      = REPLACE(signature_url,      old_prefix, new_prefix) WHERE signature_url      LIKE 'http://localhost:9000/%';
  UPDATE event_images             SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE events                   SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE gallery_items            SET url                = REPLACE(url,                old_prefix, new_prefix) WHERE url                LIKE 'http://localhost:9000/%';
  UPDATE gallery_items            SET thumbnail_url      = REPLACE(thumbnail_url,      old_prefix, new_prefix) WHERE thumbnail_url      LIKE 'http://localhost:9000/%';
  UPDATE hero_slide_gallery_items SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE hero_slides              SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE hero_slides              SET video_url          = REPLACE(video_url,          old_prefix, new_prefix) WHERE video_url          LIKE 'http://localhost:9000/%';
  UPDATE location_images          SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE locations                SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE media                    SET url                = REPLACE(url,                old_prefix, new_prefix) WHERE url                LIKE 'http://localhost:9000/%';
  UPDATE media                    SET medium_url         = REPLACE(medium_url,         old_prefix, new_prefix) WHERE medium_url         LIKE 'http://localhost:9000/%';
  UPDATE media                    SET optimized_url      = REPLACE(optimized_url,      old_prefix, new_prefix) WHERE optimized_url      LIKE 'http://localhost:9000/%';
  UPDATE media                    SET thumbnail_url      = REPLACE(thumbnail_url,      old_prefix, new_prefix) WHERE thumbnail_url      LIKE 'http://localhost:9000/%';
  UPDATE more_section_items       SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE more_sections            SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE page_header_backgrounds  SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE place_images             SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE places                   SET image_url          = REPLACE(image_url,          old_prefix, new_prefix) WHERE image_url          LIKE 'http://localhost:9000/%';
  UPDATE site_settings            SET value              = REPLACE(value,              old_prefix, new_prefix) WHERE value              LIKE 'http://localhost:9000/%';
  UPDATE social_media_content     SET url                = REPLACE(url,                old_prefix, new_prefix) WHERE url                LIKE 'http://localhost:9000/%';
  UPDATE social_media_content     SET thumbnail_url      = REPLACE(thumbnail_url,      old_prefix, new_prefix) WHERE thumbnail_url      LIKE 'http://localhost:9000/%';
  UPDATE users                    SET profile_image_url  = REPLACE(profile_image_url,  old_prefix, new_prefix) WHERE profile_image_url  LIKE 'http://localhost:9000/%';
  RAISE NOTICE 'URL migration complete: % -> %', old_prefix, new_prefix;
END \$MIGRATE\$;
"""
                }
                sshagent([env.SSH_CRED_ID]) {
                    sh "scp ${env.SSH_OPTS} fix-urls.sql ${env.CLIENT_SERVER}:/tmp/fix-urls-${env.COMPOSE_PROJECT}.sql"
                    sh """
                        ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} '
                            until docker exec ${env.COMPOSE_PROJECT}-postgres-1 pg_isready -U postgres -q; do sleep 2; done
                            docker exec -i ${env.COMPOSE_PROJECT}-postgres-1 psql -U postgres -d travel_srilanka_db < /tmp/fix-urls-${env.COMPOSE_PROJECT}.sql
                            rm /tmp/fix-urls-${env.COMPOSE_PROJECT}.sql
                        '
                    """
                }
            }
        }

        // ── 6. Health check ───────────────────────────────────────────────
        stage('Health Check') {
            steps {
                sh 'sleep 30'
                sshagent([env.SSH_CRED_ID]) {
                    sh """
                        ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} '
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
            echo "❌ [${env.PROJECT_ID}] Deployment failed — attempting to restore last running state"
            sshagent([env.SSH_CRED_ID]) {
                // Bring the stack back up with whatever images are already built.
                // This ensures the site stays live even when a new deploy fails mid-way.
                sh """
                    ssh ${env.SSH_OPTS} ${env.CLIENT_SERVER} '
                        cd /root/travelSriLankaNow
                        echo "==> Restoring stack..."
                        COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT} docker compose up -d 2>&1 || true
                        echo "==> Last 100 log lines:"
                        COMPOSE_PROJECT_NAME=${env.COMPOSE_PROJECT} docker compose logs --tail=100
                    ' || true
                """
            }
        }
    }
}
