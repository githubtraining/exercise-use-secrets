const core = require("@actions/core");
const github = require("@actions/github");
const gradeLearner = require("./lib/gradeLearner");

async function run() {
  try {
    const token = core.getInput("your-secret");
    const { owner, repo } = github.context.repo;
    const results = await gradeLearner(owner, repo, token);
    if (results.reports[0].level === "fatal") {
      throw JSON.stringify(results.reports[0].error);
    }

    const octokit = github.getOctokit(token);

    const response = await octokit.rest.repos.createDispatchEvent({
      owner,
      repo,
      event_type: "grading",
      client_payload: results,
    });
    if (response.status !== 204) {
      throw `response status code was not 201\nreceieved code: ${response.status}`;
    }
  } catch (error) {
    core.setFailed(error);
  }
}

run();
