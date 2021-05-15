import React, { useState, useEffect } from 'react'
import homeImg from "../../assets/sprintHome.svg";
import FETCH_DATA from "../../utility/utils";
import Clipboard from 'react-clipboard.js';
import {
    IconButton, Icon, InputNumber, Timeline,
    Button, Notification, Toggle, Tag,
    Input, InputPicker, FlexboxGrid, Modal
} from 'rsuite';

function SprintHome(props) {

    const [repo, setrepo] = useState(null);

    const getRepo = async () => {
        let response = await FETCH_DATA(`api/git/getRepo/${props.project.repo}`);
        setrepo(response.data.repo.data);
    }

    useEffect(() => {
        getRepo();
    }, [])

    return (
        <>
            <section style={{ display: 'flex', height: '70vh' }} >
                <section style={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                    <img style={{ maxWidth: '700px', display: 'block', margin: 'auto' }} src={homeImg} alt="homeimg" />
                </section>
                <section style={{ width: '50%', display: 'flex', justifyContent: 'center', height: '100%', alignContent: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: '100%', textAlign: 'center', fontSize: '30px', fontWeight: 'bold' }}>{props.project.name}</div>
                    <div style={{ width: '100%', textAlign: "center", marginTop: '10px' }}>{props.project.description}</div>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                        <div>
                            <Icon
                                style={{ padding: '4px 10px' }}
                                icon='github'
                                size="2x"
                            />
                        </div>
                        <Button
                            onClick={() => window.open(repo.html_url, '_blank')}
                        >
                            Open with Github
                        </Button>
                    </div>
                    {
                        repo &&
                        <div style={{ marginTop: '40px', display: 'flex' }}>
                            <Clipboard
                                data-clipboard-text={repo.clone_url}
                                style={{ background: 'none', display: 'flex' }}
                            >
                                <div style={{ background: '#e6e6e6', padding: '7px', border: '1px solid #e6e6e6' }}>Clone Url</div>
                                <div style={{ background: '#f5f5f5', padding: '7px', border: '1px solid #e6e6e6' }}>
                                    {repo.clone_url}
                                </div>
                            </Clipboard>
                            <IconButton
                                style={{ marginLeft: '10px' }}
                                icon={<Icon icon="copy" />}
                            />
                        </div>
                    }
                </section>
            </section>
        </>
    )
}

export default SprintHome
