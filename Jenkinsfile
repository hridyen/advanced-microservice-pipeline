pipeline {
    agent any

    environment {
        AUTH_CHANGED   = "false"
        CONFIG_CHANGED = "false"
        LOGIN_CHANGED  = "false"
    }

    stages {

        // 🔹 Stage 1: Checkout Code
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        // 🔹 Stage 2: Detect Changes (FIXED & STABLE)
        stage('Detect Changes') {
            steps {
                script {

                    def authChanged = false
                    def configChanged = false
                    def loginChanged = false

                    def changedFiles = []

                    // 🔥 Jenkins native change detection
                    for (changeLog in currentBuild.changeSets) {
                        for (entry in changeLog.items) {
                            for (file in entry.affectedFiles) {
                                def filePath = file.path.toString().trim().replace("\\", "/")
                                changedFiles.add(filePath)
                            }
                        }
                    }

                    echo "Changed Files: ${changedFiles}"

                    // 🔥 Detect which service changed
                    for (file in changedFiles) {

                        if (file.contains("auth-service/")) {
                            authChanged = true
                        }

                        if (file.contains("config-service/")) {
                            configChanged = true
                        }

                        if (file.contains("login-service/")) {
                            loginChanged = true
                        }
                    }

                    // 🔥 Assign to env (IMPORTANT)
                    env.AUTH_CHANGED   = authChanged.toString()
                    env.CONFIG_CHANGED = configChanged.toString()
                    env.LOGIN_CHANGED  = loginChanged.toString()

                    echo "AUTH_CHANGED: ${env.AUTH_CHANGED}"
                    echo "CONFIG_CHANGED: ${env.CONFIG_CHANGED}"
                    echo "LOGIN_CHANGED: ${env.LOGIN_CHANGED}"
                }
            }
        }

        // 🔹 Stage 3: Build Only Changed Services
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

        // 🔹 Stage 4: Run Only Changed Containers
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