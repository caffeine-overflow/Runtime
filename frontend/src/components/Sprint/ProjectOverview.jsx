import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import Loader from 'react-loader-spinner';
import ProjectOverviewBarChart from './ProjectOverviewBarChart';
import TimeEstimationChart from './TimeEstimationChart';
import BacklogCount from './BacklogCount';
import utils from "../../utility/utils";
import './projectoverview.css';

export default function ProjectOverview(props) {

    const [data, setData] = useState([]);
    let { url } = useRouteMatch();

    const getData = async () => {
        const res = await utils.FETCH_DATA(`api/projects/report/${url.split('/')[2]}`);
        setData(res.data);
    }

    useEffect(() => {
        getData();
    }, []);

    let { project } = data;
    return (
        <>
            {!!project ?
                <section className='project__overview__container'>
                    <section className="project__overview__section1">
                        <div className="po__banner">
                            <div className="po__banner__header">Project Overview</div>
                        </div>
                        <div className="po__overview__graph__section">
                            <div className="po__graph__cards__container">
                                <div>
                                    <div className="card__header">To-Do</div>
                                    <div className="card__count">{parseInt(project.toDoStories - project.backlogs.length)}</div>
                                </div>
                                <div>
                                    <div className="card__header">In-Progress</div>
                                    <div className="card__count">{project.inProgressStories}</div>
                                </div>
                                <div>
                                    <div className="card__header">Testing</div>
                                    <div className="card__count">{project.testingStories}</div>
                                </div>
                                <div>
                                    <div className="card__header">Done</div>
                                    <div className="card__count">{project.doneStories}</div>
                                </div>
                            </div>
                            <div className="barchart__container">
                                <ProjectOverviewBarChart
                                    data={[
                                        {
                                            name: 'To-Do',
                                            count: parseInt(project.toDoStories - project.backlogs.length)
                                        },
                                        {
                                            name: 'In-Progress',
                                            count: project.inProgressStories
                                        },
                                        {
                                            name: 'Testing',
                                            count: project.testingStories
                                        },
                                        {
                                            name: 'Done',
                                            count: project.doneStories
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    </section>
                    <section className="project__overview__section2">
                        <div className="estimation__chart">
                            <div className="section2__header">Time Forecast</div>
                            <TimeEstimationChart
                                data={[
                                    { name: "Spent", value: project.total_logged_time.hours },
                                    { name: "Estimated", value: project.total_estimated_time.hours }
                                ]}
                            />
                        </div>
                        <div className="backlog__count__area">
                            <div className="section2__header">Backlogs</div>
                            <BacklogCount
                                count={project.backlogs.length}
                            />
                        </div>
                    </section>
                </section>
                :
                <div style={{ height: '80vh' }}>
                    <Loader
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
                        type="ThreeDots"
                        color="#134069"
                        height={50}
                        width={50}
                    />
                </div>
            }
        </>
    )
}
