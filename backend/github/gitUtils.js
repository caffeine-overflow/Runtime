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
        private: true,
    });
}

const addMember = async (token, organization, repo, username) => {
    let octo = octokit(token);
    return await octo.request('PUT /repos/{owner}/{repo}/collaborators/{username}', {
        owner: organization,
        repo: repo,
        username: username,
        permission: 'triage'
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

const getAllRepo = async (token) => {
    let octo = octokit(token);
    return await octo.request('GET /user/repos')
}

const removeUserFromOrganization = async (token, organization, username) => {
    let octo = octokit(token);
    try {
        let userStatus = await octo.request('GET /orgs/{org}/memberships/{username}', {
            org: organization,
            username: username,
        });

        if(userStatus.data.state === "active")
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

module.exports = { getAllRepo, addMember, removeMember, getAllMembers, getOrganizationsByUser, sendOrganizationInvite, getUser, checkOrganizationMembership, hasActiveInvitation, createRepo, getRepo, removeUserFromOrganization, changeRole };