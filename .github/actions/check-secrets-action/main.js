const artifact = require("@actions/artifact");
const core = require("@actions/core");
const fs = require("fs");
const gradeLearner = require("./lib/gradeLearner");

async function run() {
  try {
    const artifactClient = artifact.create();
    const artifactName = "payload";
    const rootDirectory = "payload-dir";
    const files = [`${rootDirectory}/payload.json`];
    const results = gradeLearner();

    fs.writeFileSync(files[0], JSON.stringify(results), "utf8");
    const uploadResult = await artifactClient.uploadArtifact(
      artifactName,
      files,
      rootDirectory
    );
  } catch (error) {
    // if error, set the payload artifact to represent the error
    core.setFailed(error);
  }
}
// Verify a secret named MY_USERNAME exists
// validate the value of that secret
// set the artifact from the action

run();
