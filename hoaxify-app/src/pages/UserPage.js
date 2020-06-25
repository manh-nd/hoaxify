import React, {Component} from "react";
import * as apiCalls from '../api/apiCalls';
import ProfileCard from "../components/ProfileCard";
import {connect} from "react-redux";

class UserPage extends Component {

  state = {
    user: undefined,
    userNotFound: false,
    isLoadingUser: false,
    inEditMode: false,
    pendingUpdateCall: false,
    image: undefined
  }

  componentDidMount() {
    this.loadUser();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.match.params.username !== this.props.match.params.username) {
      this.loadUser();
    }
  }

  loadUser = () => {
    const username = this.props.match.params.username;
    if (!username) {
      return;
    }
    this.setState({userNotFound: false, isLoadingUser: true});
    apiCalls.getUser(username)
      .then(response => {
        this.setState({user: response.data, isLoadingUser: false});
      })
      .catch(error => {
        this.setState({userNotFound: true, isLoadingUser: false});
      });
  }

  onChangeDisplayName = (event) => {
    const user = {...this.state.user};
    let originalDisplayName = this.state.originalDisplayName;
    if(originalDisplayName === undefined) {
      originalDisplayName = user.displayName;
    }
    user.displayName = event.target.value;
    this.setState({user, originalDisplayName});
  }

  onClickEdit = () => {
    this.setState({inEditMode: true})
  }

  onClickCancel = () => {
    const user = {...this.state.user};
    let originalDisplayName = this.state.originalDisplayName;
    if(originalDisplayName !== undefined) {
      user.displayName = originalDisplayName;
    }
    this.setState({
      inEditMode: false,
      originalDisplayName: undefined,
      user,
      image: undefined
    });
  }

  onClickSave = () => {
    const userId = this.props.loggedInUser.id;
    const requestBody = {
      displayName: this.state.user.displayName,
      image: this.state.image && this.state.image.split(',')[1]
    };
    this.setState({pendingUpdateCall: true});
    apiCalls.updateUser(userId, requestBody)
      .then(response => {
        const user = {...this.state.user};
        user.image = response.data.image;
        this.setState({
          inEditMode: false,
          originalDisplayName: undefined,
          pendingUpdateCall: false,
          user,
          image: undefined
        });
      })
      .catch(error => {
        this.setState({
          pendingUpdateCall: false
        })
      })
  }

  onFileSelect = (event) => {
    if(!event.target.files.length) {
      return;
    }
    const file = event.target.files[0];
    let reader = new FileReader();
    reader.onloadend = () => {
      this.setState({
        image: reader.result
      })
    }
    reader.readAsDataURL(file);
  }

  render() {
    let pageContent;
    if (this.state.isLoadingUser) {
      pageContent = (
        <div className="d-flex justify-content-center text-back-50">
          <div className="spinner-border">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      )
    } else if (this.state.userNotFound) {
      pageContent = (
        <div className="alert alert-danger text-center">
          <div className="alert-heading">
            <i className="fas fa-exclamation-triangle fa-3x"/>
          </div>
          <h5>User not found</h5>
        </div>
      )
    } else {
      const isEditable = this.props.loggedInUser.username === this.props.match.params.username;
      pageContent = (this.state.user && (
        <ProfileCard
          user={this.state.user}
          isEditable={isEditable}
          inEditMode={this.state.inEditMode}
          onClickEdit={this.onClickEdit}
          onClickCancel={this.onClickCancel}
          onClickSave={this.onClickSave}
          onChangeDisplayName={this.onChangeDisplayName}
          pendingUpdateCall={this.state.pendingUpdateCall}
          loadedImage={this.state.image}
          onFileSelect={this.onFileSelect}
        />
      ));
    }
    return (
      <div data-testid="userpage">{pageContent}</div>
    )
  }
}

UserPage.defaultProps = {
  match: {
    params: {}
  }
}

const mapStateToProps = (state) => {
  return {
    loggedInUser: state
  }
}

export default connect(mapStateToProps)(UserPage);
