import React from "react";

const Input = (props) => {
  const inputClass = 'form-control' + (props.hasError !== undefined ? props.hasError ? ' is-invalid' : ' is-valid' : '');
  return (
    <div>
      {props.label && (<label>{props.label}</label>)}
      <input type={props.type || 'text'}
             className={inputClass}
             placeholder={props.placeholder}
             value={props.value}
             onChange={props.onChange}
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
