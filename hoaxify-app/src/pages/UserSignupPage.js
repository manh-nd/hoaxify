import React, {Component} from 'react';
import Input from '../components/Input';

export class UserSignupPage extends Component {

  state = {
    displayName: '',
    username: '',
    password: '',
    passwordRepeat: '',
    pendingApiCall: undefined,
    passwordRepeatConfirmed: undefined,
    errors: {}
  };

  onChangeDisplayName = (event) => {
    const displayName = event.target.value;
    const errors = {...this.state.errors};
    delete errors.displayName;
    this.setState({displayName, errors});
  }

  onChangeUsername = (event) => {
    const username = event.target.value;
    const errors = {...this.state.errors};
    delete errors.username;
    this.setState({username, errors});
  }

  onChangePassword = (event) => {
    const password = event.target.value;
    const passwordRepeat = this.state.passwordRepeat;
    const errors = {...this.state.errors};
    delete errors.password;
    let passwordRepeatConfirmed = passwordRepeat === password;
    if (passwordRepeatConfirmed) {
      delete errors.passwordRepeat;
      passwordRepeatConfirmed = true;
    } else {
      errors.passwordRepeat = 'Does not match to password';
    }
    this.setState({password, errors, passwordRepeatConfirmed});
  }

  onChangePasswordRepeat = (event) => {
    const passwordRepeat = event.target.value;
    const password = this.state.password;
    const errors = {...this.state.errors};
    let passwordRepeatConfirmed = passwordRepeat === password;
    if (passwordRepeatConfirmed) {
      delete errors.passwordRepeat;
      passwordRepeatConfirmed = true;
    } else {
      errors.passwordRepeat = 'Does not match to password';
    }
    this.setState({passwordRepeat, errors, passwordRepeatConfirmed});
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
      .catch(error => {
        let errors = {...this.state.errors};
        if (error.response && error.response.data.validationErrors) {
          errors = {...error.response.data.validationErrors};
          this.setState({errors});
        }
      })
      .finally(() => this.setState({pendingApiCall: false}));
  }

  render() {
    const disabledButton = this.state.pendingApiCall || Object.keys(this.state.errors).length > 0;
    const hasErrorPasswordRepeat = this.state.passwordRepeatConfirmed === undefined ? undefined : !this.state.passwordRepeatConfirmed;
    return (
      <div className="container">
        <h1 className="text-center mt-2">Sign Up</h1>
        <div className="mb-2">
          <Input label="Display name"
                 placeholder="Your display name"
                 value={this.state.displayName}
                 onChange={this.onChangeDisplayName}
                 hasError={this.state.errors.displayName && true}
                 error={this.state.errors.displayName}
          />
        </div>
        <div className="mb-2">
          <Input label="Username"
                 placeholder="Your username"
                 value={this.state.username}
                 onChange={this.onChangeUsername}
                 hasError={this.state.errors.username && true}
                 error={this.state.errors.username}
          />
        </div>
        <div className="mb-2">
          <Input label="Password"
                 type="password"
                 placeholder="Your password"
                 value={this.state.password}
                 onChange={this.onChangePassword}
                 hasError={this.state.errors.password && true}
                 error={this.state.errors.password}
          />
        </div>
        <div className="mb-2">
          <Input label="Password repeat"
                 type="password"
                 placeholder="Repeat your password"
                 value={this.state.passwordRepeat}
                 onChange={this.onChangePasswordRepeat}
                 hasError={hasErrorPasswordRepeat}
                 error={this.state.errors.passwordRepeat}
          />
        </div>
        <div className="text-center">
          <button className="btn btn-primary"
                  disabled={disabledButton}
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
    postSignup: (user) => new Promise(resolve => {
    })
  }
}

export default UserSignupPage;
