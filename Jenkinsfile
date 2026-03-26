pipeline {
    agent any

    environment {
        AUTH_CHANGED   = "false"
        CONFIG_CHANGED = "false"
        LOGIN_CHANGED  = "false"
    }

    stages {

        // 🔹 Checkout Code
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        // 🔹 Detect Changes (FINAL WORKING LOGIC)
        stage('Detect Changes') {
            steps {
                script {

                    def authChanged = false
                    def configChanged = false
                    def loginChanged = false

                    // 🔥 Get previous successful commit (best practice)
                    def prevCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT

                    if (!prevCommit) {
                        echo "First build detected, marking all services as changed"
                        authChanged = true
                        configChanged = true
                        loginChanged = true
                    } else {

                        def changedFiles = sh(
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

                    // 🔥 Assign to env (stable way)
                    env.AUTH_CHANGED   = authChanged.toString()
                    env.CONFIG_CHANGED = configChanged.toString()
                    env.LOGIN_CHANGED  = loginChanged.toString()

                    echo "AUTH_CHANGED: ${env.AUTH_CHANGED}"
                    echo "CONFIG_CHANGED: ${env.CONFIG_CHANGED}"
                    echo "LOGIN_CHANGED: ${env.LOGIN_CHANGED}"
                }
            }
        }

        // 🔹 Build Only Changed Services (Parallel)
        stage('Build Services') {
            parallel {

                stage('Build Auth Service') {
                    when {
                        expression { env.AUTH_CHANGED == "true" }
                    }
                    steps {
                        dir('auth-service') {
                            sh 'docker build -t auth-service .'
                        }
                    }
                }

                stage('Build Config Service') {
                    when {
                        expression { env.CONFIG_CHANGED == "true" }
                    }
                    steps {
                        dir('config-service') {
                            sh 'docker build -t config-service .'
                        }
                    }
                }

                stage('Build Login Service') {
                    when {
                        expression { env.LOGIN_CHANGED == "true" }
                    }
                    steps {
                        dir('login-service') {
                            sh 'docker build -t login-service .'
                        }
                    }
                }
            }
        }

        // 🔹 Run Containers (Only Changed)
        stage('Run Containers') {
            steps {
                script {

                    if (env.AUTH_CHANGED == "true") {
                        sh '''
                        docker rm -f auth-container || true
                        docker run -d -p 3001:3001 --name auth-container auth-service
                        '''
                    }

                    if (env.CONFIG_CHANGED == "true") {
                        sh '''
                        docker rm -f config-container || true
                        docker run -d -p 3002:3002 --name config-container config-service
                        '''
                    }

                    if (env.LOGIN_CHANGED == "true") {
                        sh '''
                        docker rm -f login-container || true
                        docker run -d -p 3003:3003 --name login-container login-service
                        '''
                    }
                }
            }
        }
    }

    // 🔹 Post Actions
    post {
        success {
            echo "Pipeline executed successfully "
        }
        failure {
            echo "Pipeline failed "
        }
    }
}