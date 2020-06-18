import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import Input from './Input';
import {waitForDomChange, waitForElement} from "@testing-library/dom";

describe('Layout', () => {

  it('has input item', () => {
    const {container} = render(<Input />);
    const input = container.querySelector('input');
    expect(input).toBeInTheDocument();
  });

  it('displays the label provided in props', () => {
    const {queryByText} = render(<Input label="test-label"/>);
    const label = queryByText('test-label');
    expect(label).toBeInTheDocument();
  });

  it('does not display the label when no label provided in props', () => {
    const {container} = render(<Input />);
    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });

  it('has text type for input when type is not provided as props', () => {
    const {container} = render(<Input />);
    const input = container.querySelector('input');
    expect(input.type).toBe('text');
  });

  it('has password type for input password type is provided as props', () => {
    const {container} = render(<Input type="password"/>);
    const input = container.querySelector('input');
    expect(input.type).toBe('password');
  });

  it('displays placeholder when type is provided as props', () => {
    const {queryByPlaceholderText} = render(<Input placeholder="test-placeholder"/>);
    const input = queryByPlaceholderText('test-placeholder');
    expect(input).toBeInTheDocument();
  });

  it('has value for input when it is provided as props', () => {
    const {container} = render(<Input value="test-value"/>);
    const input = container.querySelector('input');
    expect(input.value).toBe('test-value');
  });

  it('has onChange callback when it is provided as prop', () => {
    const onChange = jest.fn();
    const {container} = render(<Input onChange={onChange}/>);
    const input = container.querySelector('input');
    fireEvent.change(input, {target: {value: 'new-value'}});
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('has default style when there is no validation error or success', () => {
    const {container} = render(<Input />);
    const input = container.querySelector('input');
    expect(input.className).toBe('form-control');
  });

  it('has success style when hasError property is false', () => {
    const {container} = render(<Input hasError={false}/>);
    const input = container.querySelector('input');
    expect(input.className).toBe('form-control is-valid');
  });

  it('has error style when hasError property is true', () => {
    const {container} = render(<Input hasError={true}/>);
    const input = container.querySelector('input');
    expect(input.className).toBe('form-control is-invalid');
  });

  it('displays the error text when it is provided', function () {
    const {queryByText} = render(<Input hasError={true} error="Cannot be null"/>);
    const errorMessage = queryByText('Cannot be null');
    expect(errorMessage).toBeInTheDocument();
  });

  it('does not display the error text when hasError not provided', function () {
    const {queryByText} = render(<Input error="Cannot be null"/>);
    const errorMessage = queryByText('Cannot be null');
    expect(errorMessage).not.toBeInTheDocument();
  });

})
