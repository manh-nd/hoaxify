import React, {Component} from "react";
import UserList from "../components/UserList";
import HoaxSubmit from "../components/HoaxSubmit";
import {connect} from "react-redux";
import HoaxFeed from "../components/HoaxFeed";

class HomePage extends Component {

  render() {
    return (
      <div data-testid="homepage">
        <div className="row">
          <div className="col-md-8">
            <div className="mb-2">
              {this.props.loggedInUser.isLoggedIn && <HoaxSubmit />}
            </div>
            <HoaxFeed />
          </div>
          <div className="col-md-4 mt-md-0 mt-2">
            <UserList />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    loggedInUser: state
  }
}

HomePage.defaultProps = {
  loggedInUser: {}
}

export default connect(mapStateToProps)(HomePage);
