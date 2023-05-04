const core = require("@actions/core");
const github = require("@actions/github");
const gradeLearner = require("./lib/gradeLearner");

async function run() {
  try {
    const token = core.getInput("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");
    const { owner, repo } = github.context.repo;
    const results = await gradeLearner(owner, repo, token);

    if (
      results.reports[0].level === "fatal" ||
      results.reports[0].msg === "Invalid token"
    ) {
      throw `We expected: ${results.reports[0].error.expected}\nWe received: ${results.reports[0].error.got}`;
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
