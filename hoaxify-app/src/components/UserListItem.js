import React from 'react';
import {Link} from "react-router-dom";
import ProfileImageWithDefault from "./ProfileImageWithDefault";

const UserListItem = (props) => {
  const {username, displayName, image} = props.user;
  return (
    <Link to={`/${username}`}
      className="list-group-item list-group-item-action">
      <ProfileImageWithDefault
        image={image}
        alt="Profile"
        width="32px"
        height="32px"
        className="rounded-circle"
      />
      <span className="pl-2">{`${displayName}@${username}`}</span>
    </Link>
  )
}

export default UserListItem;
