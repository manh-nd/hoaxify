import React from "react";
import { v4 as uuidv4 } from 'uuid';

const Input = (props) => {
  const id = props.id ?? uuidv4();
  let inputClassName = 'form-control';
  if(props.type === 'file') {
    inputClassName += '-file';
  }
  if(props.hasError !== undefined) {
    inputClassName += props.hasError ? ' is-invalid' : ' is-valid';
  }
  return (
    <div>
      {props.label && (<label htmlFor={id}>{props.label}</label>)}
      <input type={props.type || 'text'}
             className={inputClassName}
             placeholder={props.placeholder}
             value={props.value}
             onChange={props.onChange}
             autoComplete="false"
             id={id}
             accept={props.accept}
      />
      {props.hasError && (
        <div className="invalid-feedback">
          {props.error}
        </div>
      )}
    </div>
  )
}

Input.defaultProps = {
  onChange: () => {
  }
}

export default Input;
