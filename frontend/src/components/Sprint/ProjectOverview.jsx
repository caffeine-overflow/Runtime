import React from 'react';
import ProjectOverviewBarChart from './ProjectOverviewBarChart';
import TimeEstimationChart from './TimeEstimationChart';
import './projectoverview.css';

export default function ProjectOverview() {
    return (
        <section className='project__overview__container'>
            <section className="project__overview__section1">
                <div className="po__banner">
                    <div className="po__banner__header">Project Overview</div>
                </div>
                <div className="po__overview__graph__section">
                    <div className="po__graph__cards__container">
                        <div>
                            <div className="card__header">To-Do</div>
                            <div className="card__count">25</div>
                        </div>
                        <div>
                            <div className="card__header">In-Progress</div>
                            <div className="card__count">25</div>
                        </div>
                        <div>
                            <div className="card__header">Testing</div>
                            <div className="card__count">25</div>
                        </div>
                        <div>
                            <div className="card__header">Done</div>
                            <div className="card__count">25</div>
                        </div>
                    </div>
                    <div className="barchart__container">
                        <ProjectOverviewBarChart />
                    </div>
                </div>
            </section>
            <section className="project__overview__section2">
                <div className="estimation__chart">
                    <div className="section2__header">Time Forecast</div>
                    <TimeEstimationChart />
                </div>
                <div className="backlog__count__area">
                    <div className="section2__header">Backlogs</div>
                    <TimeEstimationChart />
                </div>
            </section>
        </section>
    )
}
