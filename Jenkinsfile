pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    CI = 'true'
    // Jenkins does not load your shell profile; Homebrew Node is here on Apple Silicon Macs
    PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}"
  }

  stages {
    // Declarative already checks out SCM; no extra Checkout stage needed

    stage('Install dependencies') {
      steps {
        sh '''
          set -e
          which node
          which npm
          node -v
          npm -v
          npm ci
        '''
      }
    }

    stage('Install Playwright browsers') {
      steps {
        sh 'npx playwright install chrome'
        // If Chrome channel fails on agent, use:
        // sh 'npx playwright install chromium --with-deps'
      }
    }

    stage('Run tests') {
      steps {
        withCredentials([
          string(credentialsId: 'BASE_URL', variable: 'BASE_URL'),
          string(credentialsId: 'ADMIN_EMAIL', variable: 'ADMIN_EMAIL'),
          string(credentialsId: 'ADMIN_PASSWORD', variable: 'ADMIN_PASSWORD')
        ]) {
          sh '''
            export BASE_URL="$BASE_URL"
            export ADMIN_EMAIL="$ADMIN_EMAIL"
            export ADMIN_PASSWORD="$ADMIN_PASSWORD"
            npm test
          '''
        }
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
      archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
      publishHTML(target: [
        allowMissing: true,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: 'playwright-report',
        reportFiles: 'index.html',
        reportName: 'Playwright Report'
      ])
    }
  }
}