import React from 'react';
import {render} from '@testing-library/react';
import {UserPage} from './UserPage';
import * as apiCalls from '../api/apiCalls';
import {waitForElement} from "@testing-library/dom";

const mockGetUserSuccess = {
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile.png'
  }
}

const mockGetUserFail = {
  response: {
    data: {
      message: 'User not found'
    }
  }
}

const match = {
  params: {
    username: 'user1'
  }
}

const setup = (props) => {
  return render(<UserPage {...props}/>);
}

describe('UserPage', () => {

  describe('Layout', () => {
    it('has root page div', () => {
      const {queryByTestId} = setup();
      const userPageDiv = queryByTestId('userpage');
      expect(userPageDiv).toBeInTheDocument();
    });
    it('displays the displayName@username when user data is loaded', async () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockGetUserSuccess);
      const {queryByText} = setup({match});
      const text = await waitForElement(() => queryByText('display1@user1'));
      expect(text).toBeInTheDocument();
    });
    it('displays not found alert when user not found', async () => {
      apiCalls.getUser = jest.fn().mockRejectedValue(mockGetUserFail);
      const {queryByText} = setup({match});
      const alert = await waitForElement(() => queryByText('User not found'));
      expect(alert).toBeInTheDocument();
    });
    it('displays spinner while loading user data', () => {
      apiCalls.getUser = jest.fn().mockImplementation(() => new Promise(resolve =>
        setTimeout(() => resolve(mockGetUserSuccess), 200)
      ))
      const {queryByText} = setup({match});
      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('lifecycle', () => {
    it('calls getUser when it is rendered', () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockGetUserSuccess);
      setup({match});
      expect(apiCalls.getUser).toHaveBeenCalledTimes(1);
    });
    it('calls getUser for user when it is rendered with user1 in match', () => {
      apiCalls.getUser = jest.fn().mockResolvedValue(mockGetUserSuccess);
      setup({match});
      expect(apiCalls.getUser).toHaveBeenCalledWith('user1');
    });

  });

})
