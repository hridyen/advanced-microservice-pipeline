pipeline {
    agent { label 'ubuntu-agent'}

    environment {
        AUTH_CHANGED   = "false"
        CONFIG_CHANGED = "false"
        LOGIN_CHANGED  = "false"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Detect Changes') {
            steps {
                script {

                    def changedFiles = []

                    for (changeLog in currentBuild.changeSets) {
                        for (entry in changeLog.items) {
                            for (file in entry.affectedFiles) {
                                def filePath = file.path.toString().trim().replace("\\", "/")
                                changedFiles.add(file.path)
                            }
                        }
                    }

                    echo "Changed Files: ${changedFiles}"

                    for (file in changedFiles) { 

                        if (file.contains("auth-service")) {
                            env.AUTH_CHANGED = "true"
                        }

                        if (file.contains("config-service")) {
                            env.CONFIG_CHANGED = "true"
                        }

                        if (file.contains("login-service")) {
                            env.LOGIN_CHANGED = "true"
                        }
                    }

                    //  NOW assign to env 
                    env.AUTH_CHANGED   = authChanged.toString()
                    env.CONFIG_CHANGED = configChanged.toString()
                    env.LOGIN_CHANGED  = loginChanged.toString()


                    echo "AUTH_CHANGED: ${env.AUTH_CHANGED}"
                    echo "CONFIG_CHANGED: ${env.CONFIG_CHANGED}"
                    echo "LOGIN_CHANGED: ${env.LOGIN_CHANGED}"
                }
            }
        }

        stage('Build Services') {
            parallel {

                stage('Auth Service Build') {
                    when {
                        expression { env.AUTH_CHANGED == "true" }
                    }
                    steps {
                        dir('auth-service') {
                            sh 'docker build -t auth-service .'
                        }
                    }
                }

                stage('Config Service Build') {
                    when {
                        expression { env.CONFIG_CHANGED == "true" }
                    }
                    steps {
                        dir('config-service') {
                            sh 'docker build -t config-service .'
                        }
                    }
                }

                stage('Login Service Build') {
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

    post {
        success {
            echo "Pipeline executed successfully "
        }
        failure {
            echo "Pipeline failed "
        }
    }
}