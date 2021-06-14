import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import 'rsuite/dist/styles/rsuite-default.css';
import PrivateRoute from './components/PrivateRoute';
import AuthRenewRoute from './components/AuthRenew/AuthRenewRoute';
import ProjectBoard from './components/Sprint/ProjectBoard';
import Projects from './components/Projects';
import AuthRenewPage from './components/AuthRenew/AuthRenewPage';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import Profile from "./components/Profile";
import adminPage from "./components/Admin/adminPage";


export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" render={() => <Login />} />
        <Route path="/ResetPassword" render={() => <ResetPassword />} />
        <PrivateRoute path="/myprojects" component={aaa} />
        <PrivateRoute exact path="/projects" component={Projects} />
        <PrivateRoute exact path="/project/:id" component={ProjectBoard} />
        <PrivateRoute path="/profile" component={Profile} />
        <PrivateRoute path="/admin" component={adminPage} />
        <AuthRenewRoute path="/auth" component={AuthRenewPage} />
      </Switch>
    </Router>
  )
}

let aaa = () => <div>rere</div>