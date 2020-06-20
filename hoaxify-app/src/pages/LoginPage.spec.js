import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import {LoginPage} from './LoginPage';
import {waitForDomChange, waitForElement} from "@testing-library/dom";

describe('LoginPage', () => {

  describe('Layout', () => {

    it('has header of Login', () => {
      const {container} = render(<LoginPage/>);
      const header = container.querySelector('h1');
      expect(header).toHaveTextContent('Login');
    });

    it('has input for username', () => {
      const {queryByPlaceholderText} = render(<LoginPage/>);
      const usernameInput = queryByPlaceholderText('Your username');
      expect(usernameInput).toBeInTheDocument();
    });

    it('has input for password', () => {
      const {queryByPlaceholderText} = render(<LoginPage/>);
      const passwordInput = queryByPlaceholderText('Your password');
      expect(passwordInput).toBeInTheDocument();
    });

    it('has password type for password input', () => {
      const {queryByPlaceholderText} = render(<LoginPage/>);
      const passwordInput = queryByPlaceholderText('Your password');
      expect(passwordInput.type).toBe('password');
    });

    it('has login button', () => {
      const {container} = render(<LoginPage/>);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

  });

  describe('Interactions', () => {

    const changeEvent = (value) => ({
      target: {value}
    });

    const mockAsyncDelayed = () => jest.fn().mockImplementation(() =>
      new Promise((resolve) => {
        setTimeout(() => resolve({}), 300)
      })
    );

    let usernameInput, passwordInput, button;

    const setupForSubmit = (props) => {
      const rendered = render(<LoginPage {...props}/>);
      const {container, queryByPlaceholderText} = rendered;
      usernameInput = queryByPlaceholderText('Your username');
      passwordInput = queryByPlaceholderText('Your password');
      button = container.querySelector('button');
      fireEvent.change(usernameInput, changeEvent('my-username'));
      fireEvent.change(passwordInput, changeEvent('P4ssword'));
      return rendered;
    }

    it('sets the username value into state', () => {
      const {queryByPlaceholderText} = render(<LoginPage/>);
      const usernameInput = queryByPlaceholderText('Your username');
      fireEvent.change(usernameInput, changeEvent('my-username'));
      expect(usernameInput).toHaveValue('my-username');
    });

    it('sets the password value into state', () => {
      const {queryByPlaceholderText} = render(<LoginPage/>);
      const passwordInput = queryByPlaceholderText('Your password');
      fireEvent.change(passwordInput, changeEvent('P4ssword'));
      expect(passwordInput).toHaveValue('P4ssword');
    });

    it('calls postLogin when the actions are provided in props and fields have value', () => {
      const actions = {
        postLogin: jest.fn().mockResolvedValueOnce({})
      }
      setupForSubmit({actions});
      fireEvent.click(button);
      expect(actions.postLogin).toHaveBeenCalledTimes(1);
    });

    it('does not throw an exception when clicking the button when actions not provided in props', () => {
      setupForSubmit();
      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('calls postLogin with credentials in body', () => {
      const actions = {
        postLogin: jest.fn().mockResolvedValueOnce({})
      }
      setupForSubmit({actions});

      fireEvent.click(button);

      const credentials = {
        username: 'my-username',
        password: 'P4ssword'
      }
      expect(actions.postLogin).toHaveBeenCalledWith(credentials);
    });

    it('enables the button when username and password is not empty', () => {
      setupForSubmit();
      expect(button).not.toBeDisabled();
    });

    it('disables the button when username is empty', () => {
      setupForSubmit();
      fireEvent.change(usernameInput, changeEvent(''));
      expect(button).toBeDisabled();
    });

    it('disables the button when password is empty', () => {
      setupForSubmit();
      fireEvent.change(passwordInput, changeEvent(''));
      expect(button).toBeDisabled();
    });

    it('displays alert when login fails', async () => {
      const actions = {
        postLogin: jest.fn().mockRejectedValue({
          response: {
            data: {
              message: 'Login failed'
            }
          }
        })
      }
      const {queryByText} = setupForSubmit({actions});
      fireEvent.click(button);
      const messageAlert = await waitForElement(() => queryByText('Login failed'));
      expect(messageAlert).toBeInTheDocument();
    });

    it('clears alert when user changes username', async () => {
      const actions = {
        postLogin: jest.fn().mockRejectedValue({
          response: {
            data: {
              message: 'Login failed'
            }
          }
        })
      }
      const {queryByText} = setupForSubmit({actions});

      fireEvent.click(button);
      await waitForElement(() => queryByText('Login failed'));
      fireEvent.change(usernameInput, changeEvent('new-username'));

      const messageAlert = queryByText('Login failed');
      expect(messageAlert).not.toBeInTheDocument();
    });

    it('clears alert when user changes password', async () => {
      const actions = {
        postLogin: jest.fn().mockRejectedValue({
          response: {
            data: {
              message: 'Login failed'
            }
          }
        })
      }
      const {queryByText} = setupForSubmit({actions});

      fireEvent.click(button);
      await waitForElement(() => queryByText('Login failed'));
      fireEvent.change(passwordInput, changeEvent('new-P4ssword'));

      const messageAlert = queryByText('Login failed');
      expect(messageAlert).not.toBeInTheDocument();
    });

    it('does not allow user to click the Login button when there is an ongoing api call', () => {
      const actions = {
        postLogin: mockAsyncDelayed()
      }
      setupForSubmit({actions});
      fireEvent.click(button);
      fireEvent.click(button);
      expect(actions.postLogin).toHaveBeenCalledTimes(1);
    });

    it('displays spinner when there is an ongoing api call', async () => {
      const actions = {
        postLogin: mockAsyncDelayed()
      }
      const {queryByText} = setupForSubmit({actions});
      fireEvent.click(button);
      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });

    it('hides spinner after api call finishes successfully', async () => {
      const actions = {
        postLogin: jest.fn().mockImplementation(() =>
          new Promise((resolve) =>
            setTimeout(() => resolve({}), 200)
          )
        )
      }
      const {queryByText} = setupForSubmit({actions});
      fireEvent.click(button);
      await waitForDomChange();
      const spinner = queryByText('Loading...');
      expect(spinner).not.toBeInTheDocument();
    });

    it('hides spinner after api call finishes with error', async () => {
      const actions = {
        postLogin: jest.fn().mockImplementation(() =>
          new Promise((resolve, reject) =>
            setTimeout(() => reject({
              response: {
                data: {
                  message: 'Login failed'
                }
              }
            }), 200)
          )
        )
      }
      const {queryByText} = setupForSubmit({actions});
      fireEvent.click(button);
      await waitForDomChange();
      const spinner = queryByText('Loading...');
      expect(spinner).not.toBeInTheDocument();
    });

    it('redirect to HomePage after successful login', async () => {
      const actions = {
        postLogin: jest.fn().mockResolvedValue({})
      }
      const history = {
        push: jest.fn()
      }
      setupForSubmit({actions, history});
      fireEvent.click(button);

      await waitForDomChange();
      expect(history.push).toHaveBeenCalledWith('/');
    });

  });

})

console.error = () => {}
