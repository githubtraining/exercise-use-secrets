module.exports =
/******/ (function(modules, runtime) { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	__webpack_require__.ab = __dirname + "/";
/******/
/******/ 	// the startup function
/******/ 	function startup() {
/******/ 		// Load entry module and return exports
/******/ 		return __webpack_require__(948);
/******/ 	};
/******/
/******/ 	// run startup
/******/ 	return startup();
/******/ })
/************************************************************************/
/******/ ({

/***/ 244:
/***/ (function(module, __unusedexports, __webpack_require__) {

const core = __webpack_require__(727);
const github = __webpack_require__(933);

module.exports = async (owner, repo, token) => {
  try {
    const secretsContext = core.getInput("secrets-context");
    const keysFromCtx = Object.keys(JSON.parse(secretsContext));

    if (!repoHasExtraSecrets(keysFromCtx)) {
      return {
        reports: [
          {
            filename: ".github/workflows/use-secrets.yml",
            isCorrect: false,
            display_type: "actions",
            level: "fatal",
            msg: "Incorrect Solution",
            error: {
              expected: "Your repository should contain at least one secret.",
              got: "Your repository does not contain any secrets",
            },
          },
        ],
      };
    }

    const secretValueStatusCode = await properSecretValue(token, owner, repo);

    if (secretValueStatusCode !== 204) {
      return {
        reports: [
          {
            filename: ".github/workflows/use-secrets.yml",
            isCorrect: false,
            display_type: "actions",
            level: "warning",
            msg: "Solution COULD be incorrect",
            error: {
              expected: "HTTP response of 204",
              got: `HTTP response of ${secretValueStatusCode} which could indicate an internal error.  Please open an issue at: https://github.com/githubtraining/exercise-use-secrets and let us know!  Thank you`,
            },
          },
        ],
      };
    }

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
    return error;
  }
};

function repoHasExtraSecrets(keysFromCtx) {
  return keysFromCtx.length > 1;
}

async function properSecretValue(token, owner, repo) {
  try {
    const octokit = github.getOctokit(token);
    const response = await octokit.rest.repos.createDispatchEvent({
      owner,
      repo,
      event_type: "token_check",
    });

    return response.status;
  } catch (error) {
    if (
      error.message !== "Bad credentials" &&
      error.message !== "Parameter token or opts.auth is required"
    ) {
      throw {
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
    } else if (error.message === "Parameter token or opts.auth is required") {
      throw {
        reports: [
          {
            filename: ".github/workflows/use-secrets.yml",
            isCorrect: false,
            display_type: "actions",
            level: "fatal",
            msg: "Incorrect solution",
            error: {
              expected: "We expected your secret to contain a value",
              got: `A null value for the secret supplied at your-secret, which most likely means the secret doesn't exist.`,
            },
          },
        ],
      };
    } else {
      throw {
        reports: [
          {
            filename: ".github/workflows/use-secrets.yml",
            isCorrect: false,
            display_type: "actions",
            level: "fatal",
            msg: "Incorrect Solution",
            error: {
              expected:
                "Your secret to contain a Personal Access Token with the repo scope.",
              got: `${error.message}`,
            },
          },
        ],
      };
    }
  }
}


/***/ }),

/***/ 727:
/***/ (function(module) {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 933:
/***/ (function(module) {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 948:
/***/ (function(__unusedmodule, __unusedexports, __webpack_require__) {

const core = __webpack_require__(727);
const github = __webpack_require__(933);
const gradeLearner = __webpack_require__(244);

async function run() {
  try {
    const token = core.getInput("your-secret");
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


/***/ })

/******/ });