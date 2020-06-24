import React from "react";
import ProfileImageWithDefault from "./ProfileImageWithDefault";

const ProfileCard = (props) => {
  const {displayName, username, image} = props.user;
  return (
    <div className="card">
      <div className="card-header text-center">
        <ProfileImageWithDefault
          image={image}
          alt="Profile"
          width="200"
          height="200"
          className="rounded-circle shadow"
        />
      </div>
      <div className="card-body text-center">
        {displayName}@{username}
      </div>
    </div>
  )
};
export default ProfileCard;
