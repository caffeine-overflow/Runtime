const octokit = require("./instance");

const getUser = async (token) => {
    let octo = octokit(token);
    let user = await octo.request('GET /user');
    return user;
}

const getOrganizationsByUser = async (token) => {
    let octo = octokit(token);
    let organizations = await octo.request('GET /user/orgs');
    return organizations;
}

const sendOrganizationInvite = async (token, organization, username) => {
    let octo = octokit(token);
    await octo.request('PUT /orgs/{org}/memberships/{username}', {
        org: organization,
        username: username,
    })
}

const hasActiveInvitation = async (token, organization, username) => {
    let octo = octokit(token);
    let pendingInvite = await octo.request('GET /orgs/{org}/invitations', {
        org: organization
    });
    let invitationFound = pendingInvite.data.find(invite => invite.login === username && invite.failed_at == null);
    if (invitationFound)
        return true;
    else {
        await octo.request('PUT /orgs/{org}/memberships/{username}', {
            org: organization,
            username: username,
        })
        return false;
    }
}

const checkOrganizationMembership = async (token, organization, username) => {
    try {
        let octo = octokit(token);
        let response = await octo.request('GET /orgs/{org}/members/{username}', {
            org: organization,
            username: username,
        });
        return response.status;
    }
    catch (err) {
        return 404;
    }
}

const createRepo = async (token, organization, repoName) => {
    let octo = octokit(token);
    return await octo.request('POST /orgs/{org}/repos', {
        org: organization,
        name: repoName,
        auto_init: true,
        private: true,
    });
}

const addMember = async (token, organization, repo, username) => {
    let octo = octokit(token);
    return await octo.request('PUT /repos/{owner}/{repo}/collaborators/{username}', {
        owner: organization,
        repo: repo,
        username: username
    });
}

const removeMember = async (token, organization, repo, username) => {
    let octo = octokit(token);
    return await octo.request('DELETE /repos/{owner}/{repo}/collaborators/{username}', {
        owner: organization,
        repo: repo,
        username: username
    });
}

const getAllMembers = async (token, organization, repo, username) => {
    let octo = octokit(token);
    let members = await octo.request('GET /repos/{owner}/{repo}/collaborators', {
        owner: organization,
        repo: repo
    });
    members = members.data.map(member => member.login)
    return members
}

const getRepo = async (token, organization, repo) => {
    let octo = octokit(token);
    return await octo.request('GET /repos/{owner}/{repo}', {
        owner: organization,
        repo: repo
    });
}

const getAllRepo = async (token, organization) => {
    let octo = octokit(token);
    return await octo.request('GET /orgs/{org}/repos', {
        org: organization
    });
}

const deleteAllRepo = async (token, organization) => {
    let octo = octokit(token);
    let allRepos =  await octo.request('GET /orgs/{org}/repos', {
        org: organization
    });
    allRepos.data.forEach(async (repo) => {
        if(repo.name != 'Demo_Project')
            await octo.request('DELETE /repos/{owner}/{repo}', {
                owner: organization,
                repo: repo.name
            })
    })
}

const removeUserFromOrganization = async (token, organization, username) => {
    let octo = octokit(token);
    try {
        let userStatus = await octo.request('GET /orgs/{org}/memberships/{username}', {
            org: organization,
            username: username,
        });

        if (userStatus.data.state === "active")
            return await octo.request('DELETE /orgs/{org}/memberships/{username}', {
                org: organization,
                username: username
            })
    }
    catch (err) {
        console.log(err)
        return;
    }
}


const changeRole = async (token, organization, username, role) => {
    let octo = octokit(token);
    try {
        let userStatus = await octo.request("GET /orgs/{org}/memberships/{username}", {
            org: organization,
            username: username,
        });
        if (userStatus.data.state === "active")
            return await octo.request("PUT /orgs/{org}/memberships/{username}", {
                org: organization,
                username: username,
                role: role,
            });
    } catch (err) {
        console.log(err);
        return err;
    }
};

const getAllBranches = async (token, organization, repo) => {
    let octo = octokit(token);
    try {
        return await octo.request('GET /repos/{owner}/{repo}/branches', {
            owner: organization,
            repo: repo
        })
    }
    catch (err) {
        return err;
    }
}

const createBranch = async (token, organization, repo, newBranch, sha) => {
    let octo = octokit(token);
    try {
        return await octo.rest.git.createRef({
            owner: organization,
            repo: repo,
            ref: `refs/heads/${newBranch}`,
            sha: sha
        });
    }
    catch (err) {
        return err;
    }
}

const addComment = async (token, organization, repo, comment, sha) => {
    let octo = octokit(token);
    try {
        return await octo.request('POST /repos/{owner}/{repo}/commits/{commit_sha}/comments', {
            owner: organization,
            repo: repo,
            commit_sha: sha,
            body: comment
        });
    }
    catch (err) {
        console.log(err)
        return err;
    }
}

const getBranchComments = async (token, organization, repo, sha) => {
    let octo = octokit(token);
    try {
        return await octo.request('GET /repos/{owner}/{repo}/commits/{commit_sha}/comments', {
            owner: organization,
            repo: repo,
            commit_sha: sha
        })
    }
    catch (err) {
        return err;
    }
}

const getBranchCommits = async (token, organization, repo, branch) => {
    let octo = octokit(token);
    try {
        return await octo.request('GET /repos/{owner}/{repo}/commits', {
            owner: organization,
            repo: repo,
            sha: branch
        })
    }
    catch (err) {
        return err;
    }
}

const getPullRequestsByBranch = async (token, organization, repo, head) => {
    let octo = octokit(token);
    try {
        return await octo.request('GET /repos/{owner}/{repo}/pulls', {
            owner: organization,
            repo: repo,
            head: `${organization}:${head}`,
            state: 'all'
        })
    }
    catch (err) {
        return err;
    }
}

module.exports = {
    getOrganizationsByUser, sendOrganizationInvite, getUser, getAllBranches, createBranch, addComment,
    checkOrganizationMembership, hasActiveInvitation, createRepo, getRepo, removeUserFromOrganization,
    getBranchComments, getBranchCommits, getAllRepo, changeRole, removeMember, getAllMembers, addMember,
    getPullRequestsByBranch, deleteAllRepo
};
