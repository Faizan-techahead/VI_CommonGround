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
        // channel: 'chrome' uses system Google Chrome (see playwright.config.ts).
        // `playwright install chrome` tries sudo for deps; Jenkins has no TTY/password.
        sh '''
          set -e
          CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          if [ -x "$CHROME_BIN" ]; then
            echo "Using existing Google Chrome at: $CHROME_BIN"
            "$CHROME_BIN" --version || true
          else
            echo "ERROR: Google Chrome not found at $CHROME_BIN"
            echo "Install Chrome on the Jenkins agent, or switch the project to Playwright Chromium."
            exit 1
          fi
        '''
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