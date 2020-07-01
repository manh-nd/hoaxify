import React from 'react';
import {render} from '@testing-library/react';
import HomePage from './HomePage';
import * as apiCalls from '../api/apiCalls';
import {createStore} from "redux";
import authReducer from "../redux/authReducer";
import {Provider} from "react-redux";

apiCalls.listUsers = jest.fn().mockResolvedValue({
  data: {
    content: [],
    number: 0,
    size: 3
  }
});

const defaultState = {
  id: 1,
  displayName: 'display1',
  username: 'user1',
  image: 'profile1.png',
  password: 'P4ssword',
  isLoggedIn: true,
};

const notLoggedInState = {
  id: 0,
  displayName: '',
  username: '',
  image: '',
  password: '',
  isLoggedIn: false,
};

let store;

const setup = (state = defaultState) => {
  store = createStore(authReducer, state);
  return render(
    <Provider store={store}>
      <HomePage />
    </Provider>
  )
}

describe('HomePage', () => {

  describe('Layout', () => {
    it('has root page div', () => {
      const {queryByTestId} = setup();
      const homePageDiv = queryByTestId('homepage');
      expect(homePageDiv).toBeInTheDocument();
    });

    it('displays hoax submit when user logged in', () => {
      const {container} = setup(defaultState);
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });

    it('does not display hoax submit when user not logged in', () => {
      const {container} = setup(notLoggedInState);
      const textarea = container.querySelector('textarea');
      expect(textarea).not.toBeInTheDocument();
    });
  })

})
