// Global variables (must be defined outside pipeline block)
def authChanged = false
def configChanged = false
def loginChanged = false

pipeline {
    agent { label 'ubuntu-agent' }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Detect Changes') {
            steps {
                script {

                    // Reset variables explicitly (important for safety)
                    authChanged = false
                    configChanged = false
                    loginChanged = false

                    def prevCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT
                    def changedFiles = ""

                    if (!prevCommit) {
                        echo "First build detected. Building all services."

                        authChanged = true
                        configChanged = true
                        loginChanged = true

                    } else {

                        changedFiles = sh(
                            script: "git diff --name-only ${prevCommit} HEAD",
                            returnStdout: true
                        ).trim()

                        echo "Changed Files:\n${changedFiles}"

                        if (changedFiles.contains("auth-service/")) {
                            authChanged = true
                        }

                        if (changedFiles.contains("config-service/")) {
                            configChanged = true
                        }

                        if (changedFiles.contains("login-service/")) {
                            loginChanged = true
                        }
                    }

                    echo "authChanged: ${authChanged}"
                    echo "configChanged: ${configChanged}"
                    echo "loginChanged: ${loginChanged}"
                }
            }
        }

        stage('Build Services') {
            parallel {

                stage('Build Auth Service') {
                    when {
                        expression { authChanged }
                    }
                    steps {
                        dir('auth-service') {
                            sh 'docker build -t auth-service .'
                        }
                    }
                }

                stage('Build Config Service') {
                    when {
                        expression { configChanged }
                    }
                    steps {
                        dir('config-service') {
                            sh 'docker build -t config-service .'
                        }
                    }
                }

                stage('Build Login Service') {
                    when {
                        expression { loginChanged }
                    }
                    steps {
                        dir('login-service') {
                            sh 'docker build -t login-service .'
                        }
                    }
                }
            }
        }

        stage('Run Containers') {
            steps {
                script {

                    if (authChanged) {
                        sh '''
                        docker rm -f auth-container || true
                        docker run -d -p 3001:3001 --name auth-container auth-service
                        '''
                    }

                    if (configChanged) {
                        sh '''
                        docker rm -f config-container || true
                        docker run -d -p 3002:3002 --name config-container config-service
                        '''
                    }

                    if (loginChanged) {
                        sh '''
                        docker rm -f login-container || true
                        docker run -d -p 3003:3003 --name login-container login-service
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully"
        }
        failure {
            echo "Pipeline failed"
        }
    }
}