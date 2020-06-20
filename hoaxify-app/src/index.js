import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import UserSignupPage from "./pages/UserSignupPage";
import LoginPage from "./pages/LoginPage";
import {signup, login} from './api/apiCalls';

const actions = {
  postSignup: signup,
  postLogin: login
}

ReactDOM.render(
  <React.StrictMode>
    {/*<UserSignupPage actions={actions}/>*/}
    <LoginPage actions={actions}/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
