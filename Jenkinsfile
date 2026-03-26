pipeline {
    agent { label 'ubuntu-agent'}

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Detect Changes') {
            steps {
                script {

                    // 🔥 GLOBAL VARIABLES (IMPORTANT)
                    authChanged = false
                    configChanged = false
                    loginChanged = false

                    def prevCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT

                    def changedFiles = ""

                    if (!prevCommit) {
                        echo "First build → build everything"
                        authChanged = true
                        configChanged = true
                        loginChanged = true
                    } else {
                        changedFiles = sh(
                            script: "git diff --name-only ${prevCommit} HEAD",
                            returnStdout: true
                        ).trim()
                    }

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

                    echo "authChanged: ${authChanged}"
                    echo "configChanged: ${configChanged}"
                    echo "loginChanged: ${loginChanged}"
                }
            }
        }

        stage('Build Services') {
            parallel {

                stage('Auth Service') {
                    when {
                        expression { return authChanged == true }
                    }
                    steps {
                        dir('auth-service') {
                            sh 'docker build -t auth-service .'
                        }
                    }
                }

                stage('Config Service') {
                    when {
                        expression { return configChanged == true }
                    }
                    steps {
                        dir('config-service') {
                            sh 'docker build -t config-service .'
                        }
                    }
                }

                stage('Login Service') {
                    when {
                        expression { return loginChanged == true }
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
            echo "Pipeline executed successfully 🚀"
        }
        failure {
            echo "Pipeline failed ❌"
        }
    }
}