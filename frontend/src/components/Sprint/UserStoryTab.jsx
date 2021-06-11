import React, { useState, useEffect, useRef } from 'react';
import GitBranchImg from '../../assets/gitBranch.svg';
import PullRequestImg from '../../assets/pullrequest.svg';
import { InputPicker, Input, Button, Notification, Message, Timeline, Icon } from 'rsuite';
import './userstorytab.css';
import utils from "../../utility/utils";
import moment from 'moment';

function UserStoryTab(props) {

    const [activetab, setactivetab] = useState(0);
    const [newBranchName, setnewBranchName] = useState(props.userStory.identifier);
    const [branchFrom, setbranchFrom] = useState(null);
    const [comments, setcomments] = useState([]);
    const [comment, setcomment] = useState('');
    const messagesEndRef = useRef(null)
    const [commits, setcommits] = useState([]);
    const [base, setBase] = useState(null);
    const [pullRequests, setpullRequests] = useState([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView(true);
    }

    let createBranch = async () => {
        let token = sessionStorage.getItem('sprintCompassToken');
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ branchName: newBranchName, repo: props.project.repo, sha: branchFrom, userStoryId: props.userStory._id })
        };

        const response = await fetch(`http://localhost:5000/api/git/createBranch`, requestOptions);
        if (response.status === 200) {
            setactivetab(0);
            props.refresh();
            Notification.success({
                title: 'Branch Has Been Created',
                description: <div style={{ width: 220 }} rows={3} />,
                placement: 'topEnd'
            });
        }
        else {
            let res = await response.json();
            Notification.error({
                title: res.msg,
                description: <div style={{ width: 220 }} rows={3} />,
                placement: 'topEnd'
            });
        }
    }

    const getComments = async () => {
        let response = await utils.FETCH_DATA(`api/userstories/comments/${props.userStory._id}`);
        setcomments(response.data.comments);
    }

    const getBranchCommits = async () => {
        let response = await utils.FETCH_DATA(`api/git/getCommitsByBranch?repo=${props.project.repo}&sha=${props.userStory.git_branch}`);
        if (response.status === 200) {
            let commits = response.data.commits.data;
            if (commits) {
                let offset = commits.findIndex(c => c.sha === props.userStory.git_branch_sha);
                setcommits(commits.slice(0, offset));
            }
        }
    }

    const getPullRequests = async () => {
        let response = await utils.FETCH_DATA(`api/git/getPullRequestByBranch?repo=${props.project.repo}&head=${props.userStory.git_branch}`);
        if (response.status === 200) {
            setpullRequests(response.data.pullrequests.data);
        }
    }


    const addComment = async () => {
        let token = sessionStorage.getItem('sprintCompassToken');
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ 'body': comment, user: sessionStorage.getItem('sprintCompassUser'), userStoryId: props.userStory._id })
        };

        const response = await fetch(`http://localhost:5000/api/userstories/addComment`, requestOptions);
        let data = await response.json()

        if (response.status === 200) {
            setcomments(data.comments);
            setcomment('');
        }
        else {
            Notification.error({
                title: data.msg ?? 'Server error, Try again later',
                description: <div style={{ width: 220 }} rows={3} />,
                placement: 'topEnd'
            });
        }
    }

    useEffect(() => {
        let tabs = document.querySelectorAll('.us__tabs>div');
        tabs.forEach(t => {
            let [background] = ['#e6e6e6'];
            if (activetab === Number(t.getAttribute('data-index'))) {
                background = '#193A5A';
            }
            t.style['border-bottom'] = `3px solid ${background}`;
        })

        activetab === 0 && scrollToBottom();

    }, [activetab, commits])

    useEffect(() => {
        getComments();
        if (props.userStory.git_branch_sha) {
            getBranchCommits();
            getPullRequests();
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [comments])

    return (
        <section style={{ height: '100%', background: '#f9f9f9' }}>
            <section className='us__tabs'>
                <div data-index='0' onClick={() => setactivetab(0)}>Comments</div>
                {
                    !props.userStory.git_branch &&
                    <div data-index='1' onClick={() => setactivetab(1)}>Github Branch</div>
                }
                <div data-index='2' onClick={() => setactivetab(2)}>History</div>
                <div data-index='3' onClick={() => setactivetab(3)}>Commits</div>
                {
                    props.userStory.git_branch && <div data-index='4' onClick={() => setactivetab(4)}>Pull Request</div>
                }
            </section>
            {
                activetab === 0 &&
                <section style={{ width: '100%', height: '90%', padding: '30px' }}>
                    <section
                        className="scrollable"
                        style={{ height: '86%', overflowY: 'auto', overflowX: 'hidden' }}
                    >
                        {
                            comments.length === 0 &&
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                No comments found
                            </div>
                        }
                        {
                            comments.map((c, i) => {
                                return <section
                                    style={{ display: 'flex', width: '100%', margin: '10px 0', borderBottom: '1px solid #e6e6e6', padding: '15px' }}
                                    key={i}
                                    ref={comments.length - 1 === i ? messagesEndRef : null}
                                >
                                    <div style={{ width: '100px' }}>
                                        <img
                                            style={{ width: '55px', margin: 'auto', display: 'block', borderRadius: '50%' }}
                                            src={c.user.git_avatar}
                                            alt='avatar'
                                        />
                                    </div>
                                    <div style={{ width: '80%' }}>
                                        <div>
                                            <span style={{ fontWeight: 600, marginRight: '10px' }}>
                                                {`${c.user.firstname} ${c.user.lastname}`}
                                            </span>
                                            <span style={{ float: 'right' }}>
                                                {c.created_at}
                                            </span>
                                        </div>
                                        <div style={{ marginTop: '5px' }}>
                                            {c.body}
                                        </div>
                                    </div>
                                </section>
                            })
                        }
                        <div ref={messagesEndRef} />
                    </section>
                    <section style={{ height: '14%' }}>
                        <Input
                            onChange={(val) => setcomment(val)}
                            componentClass="textarea"
                            value={comment}
                            rows={3}
                            placeholder="Add a Comment"
                            onPressEnter={() => addComment()}
                        />
                        <Button
                            onClick={() => addComment()}
                            disabled={!comment}
                            appearance='primary'
                            style={{ width: '100px', marginTop: '20px', float: 'right' }}
                        >
                            Post
                        </Button>
                    </section>
                </section>
            }
            {
                activetab === 1 &&
                <section style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', height: '90%', flexWrap: 'wrap', overflowY: 'hidden' }}>

                    {
                        props.gitBranches.length === 0 &&
                        <Message
                            type="info"
                            title="Empty Repository"
                            description={
                                <p>You cannot create branch for an empty repo </p>
                            }
                        />
                    }
                    {
                        !props.userStory.git_branch && props.gitBranches.length > 0 &&
                        <>
                            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold', width: '100%', marginBottom: '100px' }}>
                                Create Github Branch
                            </div>
                            <section style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <section style={{ flex: 1 }}>
                                    <img style={{ width: '80%', margin: 'auto', display: 'block' }} src={GitBranchImg} alt="gitbranch" />
                                </section>
                                <section style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ margin: '5px' }}>Branch Out From</div>
                                        <InputPicker
                                            data={props.gitBranches.map((b, i) => {
                                                return { 'role': b.commit.sha, 'label': b.name, 'value': b.name }
                                            })}
                                            style={{ width: 224 }}
                                            placeholder='Branch From'
                                            onChange={(value) => {
                                                if (!!value) setbranchFrom(props.gitBranches.find(b => b.name === value).commit.sha);
                                                else
                                                    setbranchFrom(null);
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginTop: '15px' }}>
                                        <div style={{ margin: '5px' }}>Branch Name</div>
                                        <Input
                                            style={{ width: 224 }}
                                            placeholder='Name'
                                            onChange={(val) => setnewBranchName(val)}
                                            value={newBranchName}
                                        />
                                    </div>
                                    <Button
                                        style={{ marginTop: '20px', width: 224 }}
                                        appearance="primary"
                                        disabled={newBranchName === '' || !!!branchFrom}
                                        onClick={() => createBranch()}
                                    >
                                        Create Branch
                                    </Button>
                                </section>
                            </section>
                        </>
                    }
                </section>
            }
            {
                activetab === 2 &&
                <section
                    style={{ width: '100%', height: '90%', padding: '30px', overflowY: 'auto', overflowX: 'hidden' }}
                    className="scrollable"
                >
                    <Timeline endless className="custom-timeline" >
                        {
                            props.history.map(h => {
                                return <Timeline.Item
                                    dot={
                                        <Icon
                                            icon="check"
                                            size="2x"
                                            style={{ background: '#1A3B5A', color: '#fff' }}
                                        />
                                    }
                                >
                                    <p>{h.timestamp}</p>
                                    <p>{h.user}</p>
                                    <p style={{ fontWeight: 600 }}>{h.content}</p>
                                </Timeline.Item>
                            })
                        }
                    </Timeline>
                </section>

            }
            {
                activetab === 3 &&
                <section style={{ width: '100%', height: '90%', padding: '30px' }}>
                    <section
                        className="scrollable"
                        style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}
                    >
                        {
                            commits.length === 0 &&
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                No commits found
                            </div>
                        }
                        {
                            commits.map((c, i) => {
                                return <section
                                    style={{ padding: '15px 0', display: 'flex', width: '100%', borderBottom: '1px solid #e6e6e6' }}
                                    key={i}
                                >
                                    <div style={{ flex: 1 }}>
                                        <img
                                            style={{ width: '60px', margin: 'auto', display: 'block', borderRadius: '50%' }}
                                            src={c.author.avatar_url}
                                            alt='avatar'
                                        />
                                    </div>
                                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600 }}>
                                            {`${c.committer.login}`}
                                        </span>
                                    </div>
                                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        {c.commit.message}
                                    </div>
                                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        {moment(c.commit.author.date).local().format('YYYY/MM/DD HH:mm:ss')}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                        <span
                                            style={{ cursor: 'pointer', color: '#134069' }}
                                            onClick={() => window.open(c.html_url, '_blank')}
                                        >
                                            View
                                        </span>
                                    </div>
                                </section>
                            })
                        }
                    </section>
                </section>
            }
            {
                activetab === 4 &&
                <section style={{ display: 'flex', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                    <section style={{ width: '100%', height: '40vh', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
                        <img
                            style={{ height: '80%' }}
                            src={PullRequestImg}
                            alt="gitbranch"
                        />
                    </section>
                    {
                        commits.length > 0 ?
                            <>
                                {
                                    pullRequests.length > 0 &&
                                    <div style={{ marginTop: '30px', width: '100%' }}>
                                        {
                                            pullRequests.map((pr, i) => {
                                                console.log(pr);
                                                return <section key={i}
                                                    style={{
                                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                        width: '90%', margin: 'auto', textAlign: 'left', borderTop: '1px solid #e6e6e6',
                                                        borderBottom: '1px solid #e6e6e6', padding: '20px 0'
                                                    }}>
                                                    <section style={{ flex: '.5' }}>
                                                        <img src={pr.user.avatar_url} alt='git_avatar' style={{ width: '50px', borderRadius: '50%' }} />
                                                    </section>
                                                    <section style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '12px' }}>Created By</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>
                                                            {pr.user.login}
                                                        </div>
                                                    </section>
                                                    <section style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '12px' }}>Pull Request</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>{pr.title}</div>
                                                    </section>
                                                    <section style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '12px' }}>Pull Request to</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>{pr.base.ref}</div>
                                                    </section>
                                                    <section style={{ flex: '.75' }}>
                                                        <div style={{ fontSize: '12px' }}>Status</div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', marginTop: '10px' }}>{pr.state}</div>
                                                    </section>
                                                    <section style={{ flex: '.5' }}>
                                                        <div
                                                            style={{ cursor: 'pointer', color: '#134069' }}
                                                            onClick={() => window.open(pr.html_url, '_blank')}
                                                        >
                                                            View
                                                    </div>
                                                    </section>
                                                </section>
                                            })
                                        }
                                    </div>
                                }
                                {
                                    pullRequests.length === 0 &&
                                    <section style={{ width: '100%', padding: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            <div style={{ width: '100%', textAlign: 'center', margin: '5px 0' }}>Base Branch</div>
                                            <InputPicker
                                                data={
                                                    props.gitBranches.filter(gb => gb.name !== props.userStory.git_branch)
                                                        .map((b, i) => {
                                                            return { 'role': b.commit.sha, 'label': b.name, 'value': b.name }
                                                        })
                                                }
                                                style={{ width: 224 }}
                                                placeholder='Base Branch'
                                                onChange={(value) => setBase(value)}
                                            />
                                        </div>
                                        <Button
                                            style={{ marginTop: '20px', width: 224 }}
                                            appearance="primary"
                                            disabled={!!!base}
                                            onClick={() => {
                                                let org = sessionStorage.getItem("organization");
                                                let repo = props.project.repo;
                                                let head = props.userStory.git_branch;
                                                window.open(`https://github.com/${org}/${repo}/compare/${base}...${head}`, '_blank')
                                            }}
                                        >
                                            Create Pull Request
                                        </Button>
                                    </section>
                                }
                            </>
                            : <div>No commits found to make a pull request</div>
                    }
                </section>
            }
        </section>
    )
}

export default UserStoryTab
