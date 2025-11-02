node("ci-node") {

  def GIT_COMMIT_HASH = ""
  stage("Checkout") {
    checkout scm
    GIT_COMMIT_HASH = sh(script: "git log -n 1 --pretty=format:'%H'", returnStdout: true)
  }

  stage("Build") {
    sh "npm install"
    sh "npm run build"
  }

  stage("Build Docker image") {
    sh "sudo docker build -t mchekini/scpi-doc-validation-front:$GIT_COMMIT_HASH ."
  }

  stage("Push Docker image") {
    withCredentials([usernamePassword(credentialsId: 'mchekini', passwordVariable: 'password', usernameVariable: 'username')]) {
      sh "sudo docker login -u $username -p $password"
      sh "sudo docker push mchekini/sscpi-doc-validation-front:$GIT_COMMIT_HASH"
      sh "sudo docker rmi mchekini/scpi-doc-validation-front:$GIT_COMMIT_HASH"
    }
  }

}
