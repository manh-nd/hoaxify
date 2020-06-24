import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import App from "./App";
import {MemoryRouter} from "react-router-dom"
import {Provider} from "react-redux";
import axios from 'axios';
import {waitForDomChange, waitForElement} from "@testing-library/dom";
import configureStore from "../redux/configureStore";
import * as apiCalls from '../api/apiCalls';

apiCalls.listUsers = jest.fn().mockResolvedValue({
  data: {
    content: [],
    number: 0,
    size: 3
  }
});

apiCalls.getUser = jest.fn().mockResolvedValue({
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile.png'
  }
});

const changeEvent = (value) => ({
  target: {value}
});

const setup = (path) => {
  const store = configureStore(false);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <App/>
      </MemoryRouter>
    </Provider>
  );
}

beforeEach(() => {
  localStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
});

const mockSuccessGetUser1 = {
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png'
  }
}

const mockSuccessGetUser2 = {
  data: {
    id: 2,
    username: 'user2',
    displayName: 'display2',
    image: 'profile2.png'
  }
}

const mockGetUserFail = {
  response: {
    data: {
      message: 'User not found'
    }
  }
}

function setUserOneLoggedInStorage() {
  localStorage.setItem('hoax-auth', JSON.stringify({
      id: 1,
      displayName: 'display1',
      username: 'user1',
      image: 'profile1.png',
      password: 'P4ssword',
      isLoggedIn: true
    })
  );
}

describe('App', () => {

  it('displays HomePage when url is /', () => {
    const {queryByTestId} = setup('/');
    const homePageDiv = queryByTestId('homepage');
    expect(homePageDiv).toBeInTheDocument();
  });

  it('displays LoginPage when url is /login', () => {
    const {container} = setup('/login');
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Login');
  });

  it('displays only LoginPage when url is /login', () => {
    const {queryByTestId} = setup('/login');
    const homePageDiv = queryByTestId('homepage');
    expect(homePageDiv).not.toBeInTheDocument();
  });

  it('displays UserSignupPage when url is /signup', () => {
    const {container} = setup('/signup');
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Sign Up');
  });

  it('displays UserSignupPage when url is other than /, /login, /signup', () => {
    const {queryByTestId} = setup('/user1');
    const userPageDiv = queryByTestId('userpage');
    expect(userPageDiv).toBeInTheDocument();
  });

  it('displays TopBar when url is /', () => {
    const {container} = setup('/');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('displays TopBar when url is /login', () => {
    const {container} = setup('/login');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('displays TopBar when url is /signup', () => {
    const {container} = setup('/signup');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('displays TopBar when url is /user1', () => {
    const {container} = setup('/user1');
    const navigation = container.querySelector('nav');
    expect(navigation).toBeInTheDocument();
  });

  it('shows the UserSignUpPage when clicking signup', () => {
    const {queryByText, container} = setup('/');
    const signupLink = queryByText('Sign Up');
    fireEvent.click(signupLink);
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Sign Up');
  });

  it('shows the UserSignUpPage when clicking login', () => {
    const {queryByText, container} = setup('/');
    const loginLink = queryByText('Login');
    fireEvent.click(loginLink);
    const header = container.querySelector('h1');
    expect(header).toHaveTextContent('Login');
  });

  it('shows the HomePage when clicking logo', () => {
    const {queryByTestId, container} = setup('/login');
    const logo = container.querySelector('img');
    fireEvent.click(logo);
    const homePageDiv = queryByTestId('homepage');
    expect(homePageDiv).toBeInTheDocument();
  });

  it('displays My Profile on TopBar after login success', async () => {
    const {queryByPlaceholderText, container, queryByText} = setup('/login');
    const usernameInput = queryByPlaceholderText('Your username');
    const passwordInput = queryByPlaceholderText('Your password');
    const button = container.querySelector('button');
    fireEvent.change(usernameInput, changeEvent('user1'));
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 1,
        displayName: 'display1',
        username: 'user1',
        image: 'profile1.png',
      }
    })
    fireEvent.click(button);
    const profileLink = await waitForElement(() => queryByText('My Profile'));
    expect(profileLink).toBeInTheDocument();
  });

  it('displays My Profile on TopBar after signup success', async () => {
    const {queryByPlaceholderText, container, queryByText} = setup('/signup');
    const displayNameInput = queryByPlaceholderText('Your display name');
    const usernameInput = queryByPlaceholderText('Your username');
    const passwordInput = queryByPlaceholderText('Your password');
    const passwordRepeatInput = queryByPlaceholderText('Repeat your password');
    const button = container.querySelector('button');

    axios.post = jest.fn().mockResolvedValueOnce({
      data: {
        message: 'User saved'
      }
    }).mockResolvedValueOnce({
      data: {
        id: 1,
        username: 'user1',
        image: 'profile1.png',
        displayName: 'display1'
      }
    })

    fireEvent.change(displayNameInput, changeEvent('display1'));
    fireEvent.change(usernameInput, changeEvent('user1'));
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    fireEvent.change(passwordRepeatInput, changeEvent('P4ssword'));
    fireEvent.click(button);

    const profileLink = await waitForElement(() => queryByText('My Profile'));
    expect(profileLink).toBeInTheDocument();
  })

  it('saves logged in user data to localStorage after login success', async () => {
    const {queryByPlaceholderText, container, queryByText} = setup('/login');
    const usernameInput = queryByPlaceholderText('Your username');
    const passwordInput = queryByPlaceholderText('Your password');
    const button = container.querySelector('button');
    fireEvent.change(usernameInput, changeEvent('user1'));
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 1,
        displayName: 'display1',
        username: 'user1',
        image: 'profile1.png'
      }
    })
    fireEvent.click(button);
    await waitForElement(() => queryByText('My Profile'));

    const dataInStorage = JSON.parse(localStorage.getItem('hoax-auth'));
    expect(dataInStorage).toEqual({
      id: 1,
      displayName: 'display1',
      username: 'user1',
      image: 'profile1.png',
      password: 'P4ssword',
      isLoggedIn: true,
    })
  });

  it('displays logged in TopBar when storage has logged in user data', async () => {
    setUserOneLoggedInStorage();

    const {queryByText} = setup('/');
    const profileLink = await waitForElement(() => queryByText('My Profile'));

    expect(profileLink).toBeInTheDocument();
  });

  it('sets axios authorization with base64 encoded user credentials after login success', async () => {
    const {queryByPlaceholderText, container, queryByText} = setup('/login');
    const usernameInput = queryByPlaceholderText('Your username');
    const passwordInput = queryByPlaceholderText('Your password');
    const button = container.querySelector('button');
    fireEvent.change(usernameInput, changeEvent('user1'));
    fireEvent.change(passwordInput, changeEvent('P4ssword'));
    axios.post = jest.fn().mockResolvedValue({
      data: {
        id: 1,
        displayName: 'display1',
        username: 'user1',
        image: 'profile1.png',
      }
    })
    fireEvent.click(button);
    await waitForElement(() => queryByText('My Profile'));

    const axiosAuthorization = axios.defaults.headers.common['Authorization'];
    const encoded = btoa('user1:P4ssword');
    const expectedAuthorization = `Basic ${encoded}`;
    expect(axiosAuthorization).toBe(expectedAuthorization);
  });

  it('sets axios authorization with base64 encoded user credentials when storage has logged in user', async () => {
    setUserOneLoggedInStorage();

    setup('/login');
    const axiosAuthorization = axios.defaults.headers.common['Authorization'];
    const encoded = btoa('user1:P4ssword');

    const expectedAuthorization = `Basic ${encoded}`;
    expect(axiosAuthorization).toBe(expectedAuthorization);
  });

  it('removes authorization when user logout', async () => {
    setUserOneLoggedInStorage();

    const {queryByText} = setup('/');
    fireEvent.click(queryByText('Logout'));

    const axiosAuthorization = axios.defaults.headers.common['Authorization'];
    expect(axiosAuthorization).toBeFalsy();
  });

  it('updates user page after clicking my profile when another user page was opened',  async () => {
    apiCalls.getUser = jest.fn()
      .mockResolvedValueOnce(mockSuccessGetUser2)
      .mockResolvedValueOnce(mockSuccessGetUser1);
    setUserOneLoggedInStorage();

    const {queryByText} = setup('/user2');
    await waitForElement(() => queryByText('display2@user2'));
    const myProfileLink = queryByText('My Profile');
    fireEvent.click(myProfileLink);
    const user1 = await waitForElement(() => queryByText('display1@user1'));

    expect(user1).toBeInTheDocument();
  });

  it('updates user page after clicking my profile when another non existing user page was opened',  async () => {
    apiCalls.getUser = jest.fn()
      .mockRejectedValueOnce(mockGetUserFail)
      .mockResolvedValue(mockSuccessGetUser1);
    setUserOneLoggedInStorage();

    const {queryByText} = setup('/user50');
    await waitForElement(() => queryByText('User not found'));
    const myProfileLink = queryByText('My Profile');
    fireEvent.click(myProfileLink);
    const user1 = await waitForElement(() => queryByText('display1@user1'));

    expect(user1).toBeInTheDocument();
  });

});

console.error = () => {
}
