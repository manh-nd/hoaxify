import React, {Component} from 'react';
import Input from "../components/Input";
import ButtonWithProgress from "../components/ButtonWithProgress";

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
      })
      .catch(error => {
        if (error.response) {
          this.setState({apiError: error.response.data.message})
        }
      })
      .finally(() => this.setState({pendingApiCall: false}));
  }

  render() {
    const disabled = !this.state.username || !this.state.password || this.state.pendingApiCall;

    return (
      <div className="container">
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
      </div>
    )
  }
}

LoginPage.defaultProps = {
  actions: {
    postLogin: (user) => new Promise((resolve, reject) => resolve({}))
  }
}

export default LoginPage;
