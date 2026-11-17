pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    CI = 'true'
  }

  stages {
    stage('Checkout') {
      steps {
        // Option A: Pipeline from SCM — Jenkins checks out automatically
        // Option B: Pipeline script from local path — use checkout or skip
        checkout scm
      }
    }

    stage('Install dependencies') {
      steps {
        sh '''
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