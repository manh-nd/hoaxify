import React, {Component} from "react";
import UserList from "../components/UserList";
import HoaxSubmit from "../components/HoaxSubmit";
import {connect} from "react-redux";

class HomePage extends Component {

  render() {
    return (
      <div data-testid="homepage">
        <div className="row">
          <div className="col-8">
            {this.props.loggedInUser.isLoggedIn && <HoaxSubmit />}
          </div>
          <div className="col-4">
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
