import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import 'rsuite/dist/styles/rsuite-default.css';
import PrivateRoute from './components/PrivateRoute';
import Teams from './components/Teams';
import ProjectBoard from './components/ProjectBoard';
import Projects from './components/Projects';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'


export default function App() {
  return (
    <Router>
      <Switch>
        <PrivateRoute exact path="/" component={Teams} />
        <PrivateRoute exact path="/teams" component={Teams} />
        <Route path="/login" render={() => <Login />} />
        <PrivateRoute path="/myprojects" component={aaa} />
        <PrivateRoute exact path="/team/:id" component={Projects} />
        <PrivateRoute exact path="/team/project/:id" component={ProjectBoard} />
      </Switch>
    </Router>
  )
}

let aaa = () => <div>rere</div>