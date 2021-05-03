const { Octokit } = require("@octokit/rest");
  
const octokit = (token) => {
    return new Octokit({
        auth: token
    });
}

module.exports =  octokit ;