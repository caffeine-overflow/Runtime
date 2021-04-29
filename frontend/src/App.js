import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import 'rsuite/dist/styles/rsuite-default.css';
import PrivateRoute from './components/PrivateRoute';
import ProjectBoard from './components/ProjectBoard';
import Projects from './components/Projects';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import Profile from "./components/Profile";


export default function App() {
  return (
    <Router>
      <Switch>
        <PrivateRoute exact path="/" component={Projects} />
        <Route path="/login" render={() => <Login />} />
        <PrivateRoute path="/myprojects" component={aaa} />
        <PrivateRoute exact path="/projects" component={Projects} />
        <PrivateRoute exact path="/project/:id" component={ProjectBoard} />
        <PrivateRoute path="/profile" component={Profile} />
      </Switch>
    </Router>
  )
}

let aaa = () => <div>rere</div>