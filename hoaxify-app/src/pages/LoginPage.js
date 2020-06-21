import React, {Component} from 'react';
import Input from "../components/Input";
import ButtonWithProgress from "../components/ButtonWithProgress";
import {connect} from "react-redux";
import * as authActions from '../redux/authActions';

export class LoginPage extends Component {

  state = {
    username: '',
    password: '',
    apiError: undefined,
    pendingApiCall: false
  }

  onChangeUsername = (event) => {
    const username = event.target.value;
    this.setState({
      username,
      apiError: undefined
    });
  }

  onChangePassword = (event) => {
    const password = event.target.value;
    this.setState({
      password,
      apiError: undefined
    });
  }

  onClickLogin = () => {
    const credentials = {
      username: this.state.username,
      password: this.state.password
    }
    this.setState({pendingApiCall: true});
    this.props.actions.postLogin(credentials)
      .then(response => {
        this.setState({
          pendingApiCall: false
        }, () => {
          this.props.history.push('/');
        })
      })
      .catch(error => {
        if (error.response) {
          this.setState({
            pendingApiCall: false,
            apiError: error.response.data.message
          });
        }
      });
  }

  render() {
    const disabled = !this.state.username || !this.state.password || this.state.pendingApiCall;

    return (
      <form className="container">
        <h1 className="text-center">Login</h1>
        <div className="col-12 mb-2">
          <Input label="Username"
                 placeholder="Your username"
                 value={this.state.username}
                 onChange={this.onChangeUsername}
          />
        </div>
        <div className="col-12 mb-3">
          <Input label="Password"
                 placeholder="Your password"
                 type="password"
                 value={this.state.password}
                 onChange={this.onChangePassword}
          />
        </div>
        {
          this.state.apiError && (
            <div className="col-12 mb-2">
              <div className="alert alert-danger">
                {this.state.apiError}
              </div>
            </div>
          )
        }
        <div className="col-12 text-center">
          <ButtonWithProgress
            disabled={disabled}
            text="Login"
            onClick={this.onClickLogin}
            pendingApiCall={this.state.pendingApiCall}
          />
        </div>
      </form>
    )
  }
}

LoginPage.defaultProps = {
  actions: {
    postLogin: (user) => new Promise((resolve, reject) => resolve({}))
  },
  dispatch: () => {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      postLogin: (credentials) => dispatch(authActions.loginHandler(credentials))
    }
  }
}

export default connect(null, mapDispatchToProps)(LoginPage);
