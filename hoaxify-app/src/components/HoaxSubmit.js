import React, {Component} from 'react';
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import {connect} from "react-redux";
import * as apiCalls from '../api/apiCalls';
import ButtonWithProgress from "./ButtonWithProgress";

class HoaxSubmit extends Component {

  state = {
    focused: false,
    content: '',
    pendingApiCall: false,
    errors: {}
  }

  onFocus = () => {
    this.setState({focused: true});
  }

  onClickCancel = () => {
    this.setState({
      focused: false,
      content: '',
      errors: {}
    });
  }

  onChangeContent = (event) => {
    const content = event.target.value;
    this.setState({
      content,
      errors: {}
    });
  }

  onClickHoaxify = () => {
    this.setState({
      pendingApiCall: true
    })
    apiCalls.postHoax({content: this.state.content})
      .then(_ => {
        this.setState({
          focused: false,
          content: '',
          pendingApiCall: false
        })
      })
      .catch(error => {
        let errors = {...this.state.errors};
        if(error.response.data && error.response.data.validationErrors) {
          errors = error.response.data.validationErrors;
        }
        this.setState({
          pendingApiCall: false,
          errors
        });
      });
  }

  render() {
    let textareaClassName = 'form-control w-100';
    if(this.state.errors.content) {
      textareaClassName += ' is-invalid';
    }
    return (
      <div className="card d-flex flex-row p-2">
        <ProfileImageWithDefault
          className="rounded-circle mr-2"
          width="32"
          height="32"
          image={this.props.loggedInUser.image}
        />
        <div className="flex-fill">
          <textarea className={textareaClassName}
                    value={this.state.content}
                    onChange={this.onChangeContent}
                    onFocus={this.onFocus}
                    rows={this.state.focused ? 3 : 1}
          />
          {this.state.errors.content && (
            <span className="invalid-feedback">{this.state.errors.content}</span>
          )}

          {
            this.state.focused && (<div className="text-right mt-2">
              <ButtonWithProgress
                      className="btn btn-success btn-sm mr-1"
                      disabled={this.state.pendingApiCall && true}
                      pendingApiCall={this.state.pendingApiCall && true}
                      text='Hoaxify'
                      onClick={this.onClickHoaxify}>
              </ButtonWithProgress>

              <button
                className="btn btn-light btn-sm"
                disabled={this.state.pendingApiCall}
                onClick={this.onClickCancel}>
                <i className="fas fa-times"/> Cancel
              </button>
            </div>)
          }
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loggedInUser: state
  }
}

HoaxSubmit.defaultProps = {
  loggedInUser: {}
}

export default connect(mapStateToProps)(HoaxSubmit);
