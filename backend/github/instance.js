const { Octokit } = require("@octokit/rest");

const octokit = (token) => {
    return new Octokit({
        auth: token,
        previews: ['jean-grey', 'symmetra']
    });
}

module.exports = { octokit };