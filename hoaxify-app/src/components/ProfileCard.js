import React from "react";
import ProfileImageWithDefault from "./ProfileImageWithDefault";
import Input from "./Input";
import ButtonWithProgress from "./ButtonWithProgress";

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
        {!props.inEditMode && (
          <h4>{`${displayName}@${username}`}</h4>
        )}
        {props.inEditMode && (
          <div className="mb-2">
            <Input
              label={`Change Display Name For ${username}`}
              value={displayName}
              onChange={props.onChangeDisplayName}
            />
          </div>
        )}
        {props.isEditable && !props.inEditMode && (
          <button
            className="btn btn-sm btn-outline-success"
            onClick={props.onClickEdit}>
            <i className="fas fa-user-edit"/> Edit
          </button>
        )}
        {props.inEditMode && (
          <div>
            <ButtonWithProgress
              disabled={props.pendingUpdateCall}
              onClick={props.onClickSave}
              pendingApiCall={props.pendingUpdateCall}
              text={
                <span><i className="fas fa-save"/> Save</span>
              }
            />
            <button
              className="btn btn-outline-secondary ml-1"
              onClick={props.onClickCancel}
              disabled={props.pendingUpdateCall}>
              <i className="fas fa-window-close"/> Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
};
export default ProfileCard;
