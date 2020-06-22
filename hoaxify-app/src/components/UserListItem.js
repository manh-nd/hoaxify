import React from 'react';
import defaultProfile from '../assets/profile.png';
import {Link} from "react-router-dom";

const UserListItem = (props) => {
  const profileImage = props.user.image ? `/images/profile/${props.user.image}` : defaultProfile;
  return (
    <Link to={`/${props.user.username}`}
      className="list-group-item list-group-item-action">
      <img
        className="rounded-circle"
        src={profileImage}
        alt="Profile"
        width="32px"
        height="32px"
      />
      <span className="pl-2">{`${props.user.displayName}@${props.user.username}`}</span>
    </Link>
  )
}

export default UserListItem;
