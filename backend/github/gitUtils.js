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
    if(invitationFound)
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
        let response =  await octo.request('GET /orgs/{org}/members/{username}', {
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

module.exports = { getOrganizationsByUser, sendOrganizationInvite, getUser, checkOrganizationMembership, hasActiveInvitation, createRepo };