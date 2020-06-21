import React from "react";
import { v4 as uuidv4 } from 'uuid';

const Input = (props) => {
  const id = props.id ?? uuidv4();
  const inputClass = 'form-control' + (props.hasError !== undefined ? props.hasError ? ' is-invalid' : ' is-valid' : '');
  return (
    <div>
      {props.label && (<label htmlFor={id}>{props.label}</label>)}
      <input type={props.type || 'text'}
             className={inputClass}
             placeholder={props.placeholder}
             value={props.value}
             onChange={props.onChange}
             autoComplete="false"
             id={id}
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
