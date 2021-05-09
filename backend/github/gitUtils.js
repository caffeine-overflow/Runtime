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

const sendOrganizationInvite = async (token, organization, id) => {
    let octo = octokit(token);
    await octo.request('POST /orgs/{org}/invitations', {
        org: organization,
        invitee_id: id
    })
}

module.exports = { getOrganizationsByUser, sendOrganizationInvite, getUser };