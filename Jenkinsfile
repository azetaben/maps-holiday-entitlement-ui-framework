pipeline {
    // Requires a Linux Docker agent and the Jenkins Allure plugin with Allure-2.46.1 configured.
    agent { label 'linux && docker' }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    }

    triggers {
        cron('H H * * 1')
    }

    parameters {
        booleanParam(
            name: 'RUN_LIVE_SMOKE',
            defaultValue: false,
            description: 'Run the single Chromium GOV.UK smoke journey and publish its CI trend.'
        )
        booleanParam(
            name: 'RUN_NETWORK_TESTS',
            defaultValue: false,
            description: 'Run GOV.UK scenarios that require external network access.'
        )
        booleanParam(
            name: 'RUN_CROSS_BROWSER_LIVE',
            defaultValue: false,
            description: 'Run the live GOV.UK compatibility profile in Chromium, Firefox, and WebKit.'
        )
    }

    environment {
        HEADLESS = 'true'
        CI = 'true'
        RETRY = '1'
        npm_config_cache = '/tmp/holiday-ui-npm-cache'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
            }
        }

        stage('Report multibranch scheduling context') {
            steps {
                script {
                    def causes = currentBuild.getBuildCauses()
                    def timerTriggered = causes.any {
                        it._class == 'hudson.triggers.TimerTrigger$TimerTriggerCause'
                    }
                    def primaryBranch = env.BRANCH_IS_PRIMARY == 'true'
                    def manualNetworkRun = params.RUN_NETWORK_TESTS
                    def liveNetworkWillRun = manualNetworkRun || (timerTriggered && primaryBranch)
                    def context = [
                        buildUrl: env.BUILD_URL,
                        branchName: env.BRANCH_NAME,
                        branchIsPrimary: env.BRANCH_IS_PRIMARY,
                        timerTriggered: timerTriggered,
                        manualNetworkRun: manualNetworkRun,
                        liveNetworkWillRun: liveNetworkWillRun,
                        causes: causes.collect { it._class }
                    ]
                    sh 'mkdir -p reports'
                    writeFile file: 'reports/jenkins-branch-gate.json',
                        text: groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson(context))
                    echo "Jenkins branch gate evidence: ${groovy.json.JsonOutput.toJson(context)}"
                }
            }
        }

        stage('Test framework') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.64.1-noble'
                    args '--init --ipc=host'
                    reuseNode true
                }
            }
            stages {
                stage('Install and check') {
                    steps {
                        sh 'node --version && npm --version'
                        sh 'npm ci'
                        sh 'npm run check'
                    }
                }

                stage('UI scenarios') {
                    steps {
                        sh 'npm test'
                        sh 'npm run test:local:browsers'
                        sh 'npm run test:hook-integration'
                    }
                }

                stage('Live network scenarios') {
                    when {
                        anyOf {
                            expression { params.RUN_NETWORK_TESTS }
                            allOf {
                                triggeredBy 'TimerTrigger'
                                expression { env.BRANCH_IS_PRIMARY == 'true' }
                            }
                        }
                    }
                    steps {
                        script {
                            env.LIVE_NETWORK_STAGE_RAN = 'true'
                        }
                        sh 'mkdir -p reports/live-network'
                        withEnv([
                            'REPORT_DIR=reports/live-network',
                            'CUCUMBER_JUNIT_FILE=reports/live-network/cucumber-junit.xml',
                            'ALLURE_LAYER=LIVE_SERVICE',
                            'ALLURE_REPORT_NAME=GOV.UK live network suite'
                        ]) {
                            sh 'npm run test:network'
                        }
                    }
                }

                stage('Optional live smoke') {
                    when {
                        expression { params.RUN_LIVE_SMOKE }
                    }
                    steps {
                        sh 'npm run test:live:smoke'
                    }
                }

                stage('Optional live cross-browser profile') {
                    when {
                        expression { params.RUN_CROSS_BROWSER_LIVE }
                    }
                    steps {
                        sh 'npm run test:browsers'
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                def causes = currentBuild.getBuildCauses()
                def timerTriggered = causes.any {
                    it._class == 'hudson.triggers.TimerTrigger$TimerTriggerCause'
                }
                def primaryBranch = env.BRANCH_IS_PRIMARY == 'true'
                def manualNetworkRun = params.RUN_NETWORK_TESTS
                def expectedToRun = manualNetworkRun || (timerTriggered && primaryBranch)
                def actuallyRan = env.LIVE_NETWORK_STAGE_RAN == 'true'
                def context = [
                    buildUrl: env.BUILD_URL,
                    branchName: env.BRANCH_NAME,
                    branchIsPrimary: env.BRANCH_IS_PRIMARY,
                    timerTriggered: timerTriggered,
                    manualNetworkRun: manualNetworkRun,
                    liveNetworkExpectedToRun: expectedToRun,
                    liveNetworkStageRan: actuallyRan,
                    gateOutcome: expectedToRun == actuallyRan ? 'consistent' : 'review',
                    buildResult: currentBuild.currentResult,
                    causes: causes.collect { it._class }
                ]
                sh 'mkdir -p reports'
                writeFile file: 'reports/jenkins-branch-gate.json',
                    text: groovy.json.JsonOutput.prettyPrint(groovy.json.JsonOutput.toJson(context))
                echo "Final Jenkins branch gate evidence: ${groovy.json.JsonOutput.toJson(context)}"
            }
            junit allowEmptyResults: true, testResults: 'reports/**/*.xml'
            script {
                if (fileExists('allure-results')) {
                    allure commandline: 'Allure-2.46.1',
                        includeProperties: false,
                        reportBuildPolicy: 'ALWAYS',
                        results: [[path: 'allure-results']],
                        report: 'allure-report'
                } else {
                    echo 'No Allure results were produced; inspect the failed setup/check stage.'
                }
            }
            archiveArtifacts artifacts: 'reports/**, test-results/cucumber/**, allure-results/**, allure-report/**',
                allowEmptyArchive: true, fingerprint: true
        }
    }
}

