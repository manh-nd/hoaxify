import React, {Component} from 'react';

export class UserSignupPage extends Component {

  state = {
    displayName: '',
    username: '',
    password: '',
    passwordRepeat: '',
    pendingApiCall: undefined
  };

  onChangeDisplayName = (event) => {
    const value = event.target.value;
    this.setState({displayName: value});
  }

  onChangeUsername = (event) => {
    const value = event.target.value;
    this.setState({username: value});
  }

  onChangePassword = (event) => {
    const value = event.target.value;
    this.setState({password: value});
  }

  onChangePasswordRepeat = (event) => {
    const value = event.target.value;
    this.setState({passwordRepeat: value});
  }

  onClickSignup = () => {
    const requestBody = {
      username: this.state.username,
      password: this.state.password,
      displayName: this.state.displayName
    }
    this.setState({pendingApiCall: true});
    this.props.actions.postSignup(requestBody)
      .then(response => {
      })
      .catch(response => {
      })
      .finally(() => this.setState({pendingApiCall: false}));
  }

  render() {
    return (
      <div className="container">
        <h1 className="text-center mt-2">Sign Up</h1>
        <div className="mb-2">
          <label>Display name</label>
          <input className="form-control"
                 placeholder="Your display name"
                 value={this.state.displayName}
                 onChange={this.onChangeDisplayName}
          />
        </div>
        <div className="mb-2">
          <label>Username</label>
          <input className="form-control"
                 placeholder="Your username"
                 value={this.state.username}
                 onChange={this.onChangeUsername}
          />
        </div>
        <div className="mb-2">
          <label>Password</label>
          <input className="form-control"
                 type="password"
                 placeholder="Your password"
                 value={this.state.password}
                 onChange={this.onChangePassword}
          />
        </div>
        <div className="mb-2">
          <label>Password repeat</label>
          <input className="form-control"
                 type="password"
                 placeholder="Repeat your password"
                 value={this.state.passwordRepeat}
                 onChange={this.onChangePasswordRepeat}
          />
        </div>
        <div className="text-center">
          <button className="btn btn-primary"
                  disabled={this.state.pendingApiCall}
                  onClick={this.onClickSignup}>
            {this.state.pendingApiCall && (
              <div className="spinner-border spinner-border-sm text-light mr-sm-1">
                <span className="sr-only">Loading...</span>
              </div>
            )}
            Sign Up
          </button>
        </div>
      </div>
    );
  }
}

UserSignupPage.defaultProps = {
  actions: {
    postSignup: (user) => new Promise(resolve => {})
  }
}

export default UserSignupPage;
