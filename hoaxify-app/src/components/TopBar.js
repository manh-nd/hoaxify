import React, {Component} from "react";
import logo from '../assets/hoaxify-logo.png';
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import ProfileImageWithDefault from "./ProfileImageWithDefault";

class TopBar extends Component {

  state = {
    dropdownVisible: false
  }

  componentDidMount() {
    document.addEventListener('click', this.onClickTracker);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onClickTracker);
  }

  onClickTracker = (event) => {
    if(this.actionArea && !this.actionArea.contains(event.target)) {
      this.setState({
        dropdownVisible: false
      });
    }
  }

  onClickUsername = () => {
    this.setState({dropdownVisible: true})
  }

  assignActionArea = (area) => {
    this.actionArea = area;
  }

  onClickLogout = () => {
    this.setState({
      dropdownVisible: false
    });
    const action = {
      type: 'LOGOUT_SUCCESS'
    };
    this.props.dispatch(action);
  }

  onClickMyProfile = () => {
    this.setState({
      dropdownVisible: false
    });
  }

  render() {
    let links = (
      <ul className="nav navbar-nav ml-auto">
        <li className="nav-item">
          <Link to="/signup" className="nav-link">
            Sign Up
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </li>
      </ul>
    );
    if (this.props.user.isLoggedIn) {
      let dropdownMenuClassName = 'shadow dropdown-menu dropdown-menu-right';
      if(this.state.dropdownVisible) {
        dropdownMenuClassName += ' show';
      }
      links = (
        <ul className="nav navbar-nav ml-auto" ref={this.assignActionArea}>
          <li className="nav-item dropdown">
            <div
              className="d-flex align-items-center dropdown-toggle"
              onClick={this.onClickUsername}
              style={{cursor: 'pointer'}}>
              <ProfileImageWithDefault
                image={this.props.user.image}
                alt="Profile"
                width="32"
                height="32"
                className="rounded-circle"
              />
              <span className="nav-link">{this.props.user.displayName}</span>
            </div>
            <div className={dropdownMenuClassName}>
              <div onClick={this.onClickMyProfile}>
                <Link to={`/${this.props.user.username}`} className="dropdown-item">
                  <i className="fas fa-user text-info mr-1" />
                  My Profile
                </Link>
              </div>
              <div className="dropdown-item"
                   style={{cursor: 'pointer'}}
                   onClick={this.onClickLogout}>
                <i className="fas fa-sign-out-alt text-danger mr-1" />
                Logout
              </div>
            </div>
          </li>
        </ul>
      )
    }
    return (
      <div className="bg-white shadow-sm mb-2">
        <div className="container">
          <nav className="navbar navbar-light navbar-expand">
            <Link to="/" className="navbar-brand">
              <img src={logo} width="60" alt="Hoaxify"/> Hoaxify
            </Link>
            {links}
          </nav>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state
  }
}

export default connect(mapStateToProps)(TopBar);
