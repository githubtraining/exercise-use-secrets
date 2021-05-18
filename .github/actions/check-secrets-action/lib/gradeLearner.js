const core = require("@actions/core");
const github = require("@actions/github");

module.exports = () => {
  // if it has less than 1 secret... set the payload artifact to incorrect, no secret exists
  // return
  try {
    const secretsContext = core.getInput("secrets-context");
    const username = core.getInput("your-secret");
    const keysFromCtx = Object.keys(JSON.parse(secretsContext));
    const githubContext = github.context;
    if (!repoHasExtraSecrets(keysFromCtx)) {
      return {
        reports: [
          {
            filename: ".github/workflows/use-secrets.yml",
            isCorrect: false,
            display_type: "actions",
            level: "warning",
            msg: "Incorrect Solution",
            error: {
              expected: "Your repository to contain at least one secret.",
              got: "Your repository does not contain any secrets",
            },
          },
        ],
      };
    }

    // if the secret does not have proper name... set the payload artifact to incorrect, wrong secret
    // return
    if (!properSecretExists(keysFromCtx)) {
      return {
        reports: [
          {
            filename: ".github/workflows/use-secrets.yml",
            isCorrect: false,
            display_type: "actions",
            level: "warning",
            msg: "Incorrect Solution",
            error: {
              expected: "Your secret to be named MY_USERNAME",
              got: "An invalid value",
            },
          },
        ],
      };
    }
    // if the value is not the username... set the payload artifact to incorrect, wrong value
    // return
    if (!properSecretValue(username, githubContext)) {
      return {
        reports: [
          {
            filename: ".github/workflows/use-secrets.yml",
            isCorrect: false,
            display_type: "actions",
            level: "warning",
            msg: "Incorrect Solution",
            error: {
              expected:
                "Your MY_USERNAME secret to match your GitHub username.",
              got: `${githubContext.actor}`,
            },
          },
        ],
      };
    }

    // if all 3 things are right then set artifcat to success
    return {
      reports: [
        {
          filename: ".github/workflows/use-secrets.yml",
          isCorrect: true,
          display_type: "actions",
          level: "info",
          msg: "Correct Solution",
          error: {
            expected: "",
            got: "",
          },
        },
      ],
    };
  } catch (error) {
    return {
      reports: [
        {
          filename: ".github/workflows/use-secrets.yml",
          isCorrect: false,
          display_type: "actions",
          level: "fatal",
          msg: "",
          error: {
            expected: "",
            got: "An internal error occurred.  Please open an issue at: https://github.com/githubtraining/lab-use-secrets and let us know!  Thank you",
          },
        },
      ],
    };
  }
};

function repoHasExtraSecrets(keysFromCtx) {
  return keysFromCtx.length > 1;
}

function properSecretExists(keysFromCtx) {
  return keysFromCtx.includes("my_username");
}

function properSecretValue(username, ctx) {
  return username === ctx.actor;
}
