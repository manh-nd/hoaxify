import React, {Component} from 'react';
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import { format } from 'timeago.js';
import {Link} from "react-router-dom";

class HoaxView extends Component {
  render() {
    const {hoax} = this.props;
    const {user, content, timestamp} = hoax;
    const {displayName, username, image} = user;
    const relativeDate = format(timestamp);
    return (
      <div className="card p-2 mb-1">
        <div className="d-flex">
          <ProfileImageWithDefault
            image={image}
            width="32"
            height="32"
            className="rounded-circle"
          />
          <div className="flex-fill ml-2">
            <Link to={`${username}`} className="list-group-item-action">
              <h6 className="mb-0 d-inline">{displayName}@{username}</h6>
            </Link>
            <span className="text-black-50"> - </span>
            <span className="text-black-50"> {relativeDate} </span>
          </div>
        </div>
        <div className="d-flex">
          <div style={{width: '32px'}} />
          <div className="flex-fill ml-2">
            {content}
          </div>
        </div>
      </div>
    );
  }
}

export default HoaxView;
