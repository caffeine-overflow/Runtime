import React, { useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router-dom';
import Loader from 'react-loader-spinner';
import ProjectOverviewBarChart from './ProjectOverviewBarChart';
import TimeEstimationChart from './TimeEstimationChart';
import BacklogCount from './BacklogCount';
import utils from "../../utility/utils";
import './projectoverview.css';

export default function SprintOverview(props) {

    const [data, setData] = useState([]);
    let { url } = useRouteMatch();

    const getData = async () => {
        if (props.currentSprint) {
			const res = await utils.FETCH_DATA(`api/sprints/report/${props.currentSprint._id}`);
			setData(res.data);
		}
    }

    useEffect(() => {
        getData();
    }, []);

    let { sprint } = data;
    return (
        <>
            {!!sprint ?
                <section className='project__overview__container'>
                    <section className="project__overview__section1">
                        <div className="po__banner">
                            <div className="po__banner__header">Sprint Overview</div>
                        </div>
                        <div className="po__overview__graph__section">
                            <div className="po__graph__cards__container">
                                <div>
                                    <div className="card__header">To-Do</div>
                                    <div className="card__count">{sprint.toDoStories}</div>
                                </div>
                                <div>
                                    <div className="card__header">In-Progress</div>
                                    <div className="card__count">{sprint.inProgressStories}</div>
                                </div>
                                <div>
                                    <div className="card__header">Testing</div>
                                    <div className="card__count">{sprint.testingStories}</div>
                                </div>
                                <div>
                                    <div className="card__header">Done</div>
                                    <div className="card__count">{sprint.doneStories}</div>
                                </div>
                            </div>
                            <div className="barchart__container">
                                <ProjectOverviewBarChart
                                    data={[
                                        {
                                            name: 'To-Do',
                                            count: sprint.toDoStories
                                        },
                                        {
                                            name: 'In-Progress',
                                            count: sprint.inProgressStories
                                        },
                                        {
                                            name: 'Testing',
                                            count: sprint.testingStories
                                        },
                                        {
                                            name: 'Done',
                                            count: sprint.doneStories
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
                                    { name: "Spent", value: sprint.total_logged_time.hours },
                                    { name: "Estimated", value: sprint.total_estimated_time.hours }
                                ]}
                            />
                        </div>
                        <div className="backlog__count__area">
                            <div className="section2__header">Backlogs</div>
                            <BacklogCount
                                count={sprint.backlogs.length}
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
