import React from 'react';
import PasswordRenewSvg from '../../assets/passwordRenew.svg';
import BioSvg from '../../assets/bio.svg';
import Gitsvg from '../../assets/git.svg';
import './authrenew.css';

import {
    Steps, Panel, ButtonGroup, Button
} from 'rsuite';

export default function AuthRenewPage() {

    const [step, setStep] = React.useState(0);
    const onChange = nextStep => {
        setStep(nextStep < 0 ? 0 : nextStep > 2 ? 2 : nextStep);
    };

    const onNext = () => onChange(step + 1);
    const onPrevious = () => onChange(step - 1);

    return (
        <div style={{ width: '80%', margin: 'auto', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '80vh' }}>
                <Steps current={step}>
                    <Steps.Item title="Change Password" description="Description" />
                    <Steps.Item title="Update Bio" description="Description" />
                    <Steps.Item title="Authorize Github" description="Description" />
                </Steps>
                <hr />
                <Panel style={{ height: '60vh' }} >
                    <section style={{ display: 'flex' }}>
                        <div style={{ width: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {
                                step === 0 &&
                                <img style={{ maxWidth: '550px' }} src={PasswordRenewSvg} alt="passwordrenewimg" />
                            }
                            {
                                step === 1 &&
                                <img style={{ maxWidth: '550px' }} src={BioSvg} alt="passwordrenewimg" />
                            }
                            {
                                step === 2 &&
                                <img style={{ maxWidth: '550px' }} src={Gitsvg} alt="passwordrenewimg" />
                            }
                        </div>
                        <div style={{ flex: 1 }}>
                        </div>
                    </section>
                </Panel>
                <hr />
                <div style={{ float: 'right' }}>
                    <ButtonGroup>
                        <Button onClick={onPrevious} disabled={step === 0}>
                            Previous
                        </Button>
                        <Button onClick={onNext} disabled={step === 2}>
                            Next
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </div>
    )
}