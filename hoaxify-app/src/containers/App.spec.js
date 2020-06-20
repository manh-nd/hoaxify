import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import App from "./App";
import {MemoryRouter} from "react-router-dom";

const setup = (path) => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App/>
    </MemoryRouter>
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

});
