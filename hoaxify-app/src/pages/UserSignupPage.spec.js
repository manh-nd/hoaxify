import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import {UserSignupPage} from './UserSignupPage';
import {waitForDomChange, waitForElement} from "@testing-library/dom";

describe('UserSignupPage', () => {

  describe('Layout', () => {
    it('has header of Sign Up', () => {
      const {container} = render(<UserSignupPage/>);
      const header = container.querySelector('h1');
      expect(header).toHaveTextContent('Sign Up');
    });

    it('has input for display name', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const displayNameInput = queryByPlaceholderText('Your display name');
      expect(displayNameInput).toBeInTheDocument();
    });

    it('has input for username', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const usernameInput = queryByPlaceholderText('Your username');
      expect(usernameInput).toBeInTheDocument();
    });

    it('has input for password', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const passwordInput = queryByPlaceholderText('Your password');
      expect(passwordInput).toBeInTheDocument();
    });

    it('has password type for password', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const passwordInput = queryByPlaceholderText('Your password');
      expect(passwordInput.type).toBe('password');
    });

    it('has input for password repeat', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const passwordRepeatInput = queryByPlaceholderText('Repeat your password');
      expect(passwordRepeatInput).toBeInTheDocument();
    });

    it('has password type for password repeat', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const passwordRepeatInput = queryByPlaceholderText('Repeat your password');
      expect(passwordRepeatInput.type).toBe('password');
    });

    it('has password type for password repeat', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const passwordRepeatInput = queryByPlaceholderText('Repeat your password');
      expect(passwordRepeatInput.type).toBe('password');
    });

    it('has submit button', () => {
      const {container} = render(<UserSignupPage/>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {

    const changeEvent = (value) => ({
      target: {value}
    });

    it('sets the displayName value into state', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const displayNameInput = queryByPlaceholderText('Your display name');
      fireEvent.change(displayNameInput, changeEvent('my-display-name'));
      expect(displayNameInput).toHaveValue('my-display-name');
    });

    it('sets the username value into state', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const usernameInput = queryByPlaceholderText('Your username');
      fireEvent.change(usernameInput, changeEvent('my-username'));
      expect(usernameInput).toHaveValue('my-username');
    });

    it('sets the password value into state', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const passwordInput = queryByPlaceholderText('Your password');
      fireEvent.change(passwordInput, changeEvent('P4ssword'));
      expect(passwordInput).toHaveValue('P4ssword');
    });

    it('sets the password repeat value into state', () => {
      const {queryByPlaceholderText} = render(<UserSignupPage/>);
      const passwordRepeatInput = queryByPlaceholderText('Repeat your password');
      fireEvent.change(passwordRepeatInput, changeEvent('P4ssword'));
      expect(passwordRepeatInput).toHaveValue('P4ssword');
    });

    let displayNameInput,
      usernameInput,
      passwordInput,
      passwordRepeatInput,
      button;

    const setupForSubmit = (props) => {
      const rendered = render(<UserSignupPage {...props}/>);
      const {container, queryByPlaceholderText} = rendered;
      displayNameInput = queryByPlaceholderText('Your display name');
      usernameInput = queryByPlaceholderText('Your username');
      passwordInput = queryByPlaceholderText('Your password');
      passwordRepeatInput = queryByPlaceholderText('Repeat your password');
      button = container.querySelector('button');
      fireEvent.change(displayNameInput, changeEvent('my-display-name'));
      fireEvent.change(usernameInput, changeEvent('my-username'));
      fireEvent.change(passwordInput, changeEvent('P4ssword'));
      fireEvent.change(passwordRepeatInput, changeEvent('P4ssword'));
      return rendered;
    }

    it('calls postSignUp when the fields are valid and the actions are provided in props', () => {
      const actions = {
        postSignup: jest.fn().mockResolvedValueOnce({})
      }
      setupForSubmit({actions});
      fireEvent.click(button);
      expect(actions.postSignup).toHaveBeenCalledTimes(1);
    });

    it('does not throw exception when the actions are provided in props', () => {
      setupForSubmit();
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('calls post with user body when the fields are valid', () => {
      const actions = {
        postSignup: jest.fn().mockResolvedValueOnce({})
      }
      setupForSubmit({actions});
      const expectedUserObject = {
        username: 'my-username',
        password: 'P4ssword',
        displayName: 'my-display-name',
      }
      fireEvent.click(button);
      expect(actions.postSignup).toHaveBeenCalledWith(expectedUserObject);
    });

    const mockAsyncDelayed = () => jest.fn().mockImplementation(() =>
      new Promise((resolve) => {
        setTimeout(() => resolve({}), 300)
      })
    );

    it('does not allow user to click the Sign Up button when there is an ongoing api call', () => {
      const actions = {
        postSignup: mockAsyncDelayed()
      }
      setupForSubmit({actions});

      fireEvent.click(button);
      fireEvent.click(button);

      expect(actions.postSignup).toHaveBeenCalledTimes(1);
    });

    it('displays spinner when there is an ongoing api call', () => {
      const actions = {
        postSignup: mockAsyncDelayed()
      }
      const {queryByText} = setupForSubmit({actions});

      fireEvent.click(button);
      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });

    it('hides spinner after api call finishes successfully', async () => {
      const actions = {
        postSignup: mockAsyncDelayed()
      }
      const {queryByText} = setupForSubmit({actions});

      fireEvent.click(button);
      const spinner = queryByText('Loading...');
      await waitForDomChange();

      expect(spinner).not.toBeInTheDocument();
    });

    it('hides spinner after api call finishes with error', async () => {
      const actions = {
        postSignup: jest.fn().mockImplementation(() =>
          new Promise((resolve, reject) =>
            setTimeout(() => reject({}), 300)
          )
        )
      }
      const {queryByText} = setupForSubmit({actions});

      fireEvent.click(button);
      const spinner = queryByText('Loading...');
      await waitForDomChange();

      expect(spinner).not.toBeInTheDocument();
    });

    it('displays validation error for displayName when error is received for the field', async () => {
      const actions = {
        postSignup: jest.fn().mockRejectedValue({
          response: {
            data: {
              validationErrors: {
                displayName: 'Cannot be null'
              }
            }
          }
        })
      }
      const {queryByText} = setupForSubmit({actions});
      fireEvent.click(button);
      const errorMessage = await waitForElement(() => queryByText('Cannot be null'));
      expect(errorMessage).toBeInTheDocument();
    });

    it('enables the signup button when password and password repeat has same value', () => {
      setupForSubmit();
      expect(button).not.toBeDisabled();
    });

    it('disables the signup button when password repeat does not match to password', () => {
      setupForSubmit();
      fireEvent.change(passwordRepeatInput, changeEvent('newP4ssword'))
      expect(button).toBeDisabled();
    });

    it('disables the signup button when password does not match to password repeat ', () => {
      setupForSubmit();
      fireEvent.change(passwordInput, changeEvent('newP4ssword'))
      expect(button).toBeDisabled();
    });

    it('disables error style for password repeat when password repeat mismatch', () => {
      const {queryByText} = setupForSubmit();
      fireEvent.change(passwordRepeatInput, changeEvent('newP4ssword'))
      const mismatchWarning = queryByText('Does not match to password');
      expect(mismatchWarning).toBeInTheDocument();
    });

    it('disables error style for password repeat when password mismatch', () => {
      const {queryByText} = setupForSubmit();
      fireEvent.change(passwordInput, changeEvent('newP4ssword'))
      const mismatchWarning = queryByText('Does not match to password');
      expect(mismatchWarning).toBeInTheDocument();
    });

    it('hides the validation error for displayName when user changes the content of displayName', async () => {
      const actions = {
        postSignup: jest.fn().mockRejectedValue({
          response: {
            data: {
              validationErrors: {
                displayName: 'Cannot be null'
              }
            }
          }
        })
      }
      const {queryByText} = setupForSubmit({actions});
      fireEvent.click(button);
      await waitForElement(() => queryByText('Cannot be null'));

      fireEvent.change(displayNameInput, changeEvent('new-name'));

      const errorMessage = queryByText('Cannot be null');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('hides the validation error for username when user changes the content of username', async () => {
      const actions = {
        postSignup: jest.fn().mockRejectedValue({
          response: {
            data: {
              validationErrors: {
                username: 'Cannot be null'
              }
            }
          }
        })
      }
      const {queryByText} = setupForSubmit({actions});
      fireEvent.click(button);
      await waitForElement(() => queryByText('Cannot be null'));

      fireEvent.change(usernameInput, changeEvent('new-name'));

      const errorMessage = queryByText('Cannot be null');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('hides the validation error for password when user changes the content of password', async () => {
      const actions = {
        postSignup: jest.fn().mockRejectedValue({
          response: {
            data: {
              validationErrors: {
                password: 'Cannot be null'
              }
            }
          }
        })
      }
      const {queryByText} = setupForSubmit({actions});
      fireEvent.click(button);
      await waitForElement(() => queryByText('Cannot be null'));

      fireEvent.change(passwordInput, changeEvent('newP4ssword'));

      const errorMessage = queryByText('Cannot be null');
      expect(errorMessage).not.toBeInTheDocument();
    });

  });

});

console.error = () => {
}
