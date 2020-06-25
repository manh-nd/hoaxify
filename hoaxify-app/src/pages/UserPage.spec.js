import React from 'react';
import {fireEvent, render} from '@testing-library/react';
import UserPage from './UserPage';
import * as apiCalls from '../api/apiCalls';
import {waitForDomChange, waitForElement} from "@testing-library/dom";
import {Provider} from "react-redux";
import configureStore from "../redux/configureStore";
import axios from "axios";

const mockGetUserSuccess = {
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png'
  }
}

const mockGetUserFail = {
  response: {
    data: {
      message: 'User not found'
    }
  }
}

const mockSuccessUpdateUser = {
  data: {
    id: 1,
    username: 'user1',
    displayName: 'display-1-update',
    image: 'profile1-update.png'
  }
}

const mockFailUpdateUser = {
  response: {
    data: {
    }
  }
}

const match = {
  params: {
    username: 'user1'
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

const setup = (props) => {
  const store = configureStore(false);
  return render(
    <Provider store={store}>
      <UserPage {...props}/>
    </Provider>
  );
}

beforeEach(() => {
  localStorage.clear();
  delete axios.defaults.headers.common['Authorization'];
});

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

    it('displays edit button when loggedInUser matches to user in url', async () => {
      setUserOneLoggedInStorage();
      apiCalls.getUser = jest.fn().mockResolvedValue(mockGetUserSuccess);
      const {queryByText} = setup({match});
      await waitForElement(() => queryByText('display1@user1'));
      const editButton = queryByText('Edit');
      expect(editButton).toBeInTheDocument();
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

  describe('ProfileCard Interactions', () => {

    const setupForEdit = async () => {
      setUserOneLoggedInStorage();
      apiCalls.getUser = jest.fn().mockResolvedValue(mockGetUserSuccess);
      const rendered = setup({match});
      const editButton = await waitForElement(() => rendered.queryByText('Edit'));
      fireEvent.click(editButton);
      return rendered;
    }

    const mockSuccessUpdateUserAsyncDelayed = () => {
      return jest.fn().mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mockSuccessUpdateUser), 200)
        )
      );
    }

    it('displays edit layout when clicking edit button', async () => {
      const {queryByText} = await setupForEdit();
      expect(queryByText('Save')).toBeInTheDocument();
    });

    it('returns back to none edit mode after clicking cancel button', async () => {
      const {queryByText} = await setupForEdit();
      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);
      expect(queryByText('Edit')).toBeInTheDocument();
    });

    it('calls updateUser api when clicking save', async () => {
      const {queryByText} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);
      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);
      expect(apiCalls.updateUser).toHaveBeenCalledTimes(1);
    });

    it('calls updateUser api with user id', async () => {
      const {queryByText} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);
      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);
      const userId = apiCalls.updateUser.mock.calls[0][0];
      expect(userId).toBe(1);
    });

    it('calls updateUser api with request body having changed displayName', async () => {
      const {queryByText, container} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const displayInput = container.querySelector('input');
      fireEvent.change(displayInput, {target: {value: 'display-1-update'}});

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);
      const requestBody = apiCalls.updateUser.mock.calls[0][1];

      expect(requestBody.displayName).toBe('display-1-update');
    });

    it('returns to non edit mode after successful updateUser api call', async () => {
      const {queryByText, container} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const displayInput = container.querySelector('input');
      fireEvent.change(displayInput, {target: {value: 'display-1-update'}});

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      const editButton = await waitForElement(() => queryByText('Edit'));

      expect(editButton).toBeInTheDocument();
    });

    it('returns to original displayName after its changed in edit mode but cancelled', async () => {
      const {queryByText, container} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const displayInput = container.querySelector('input');
      fireEvent.change(displayInput, {target: {value: 'display-1-update'}});

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      const userInfo = queryByText('display1@user1')
      expect(userInfo).toBeInTheDocument();
    });

    it('returns to last updated displayName when displayName is changed for another time but cancelled', async () => {
      const {queryByText, container} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      let displayInput = container.querySelector('input');
      fireEvent.change(displayInput, {target: {value: 'display-1-update'}});

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      const editButtonAfterClickingSave = await waitForElement(() => queryByText('Edit'));
      fireEvent.click(editButtonAfterClickingSave);

      displayInput = container.querySelector('input');
      fireEvent.change(displayInput, {target: {value: 'display-1-update-second-time'}});

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      const userInfo = container.querySelector('h4')
      expect(userInfo).toHaveTextContent('display-1-update@user1');
    });

    it('displays the spinner when there is updateUser api call', async () => {
      const {queryByText} = await setupForEdit();
      apiCalls.updateUser = mockSuccessUpdateUserAsyncDelayed();
      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);
      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });

    it('disabled save button when there is updateUser api call', async () => {
      const {queryByText} = await setupForEdit();
      apiCalls.updateUser = mockSuccessUpdateUserAsyncDelayed();
      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);
      expect(saveButton).toBeDisabled();
    });

    it('disabled cancel button when there is updateUser api call', async () => {
      const {queryByText} = await setupForEdit();
      apiCalls.updateUser = mockSuccessUpdateUserAsyncDelayed();

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      const cancelButton = queryByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });

    it('enables save button after updateUser api call success', async () => {
      const {queryByText} = await setupForEdit();
      apiCalls.updateUser = mockSuccessUpdateUserAsyncDelayed();

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);
      const editButton = await waitForElement(() => queryByText('Edit'));
      fireEvent.click(editButton);

      const saveButtonAfterClickEditSecondTime = queryByText('Save');
      expect(saveButtonAfterClickEditSecondTime.parentElement).not.toBeDisabled();
    });

    it('enables save button after updateUser api call fails', async () => {
      const {queryByText} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      let saveButton = queryByText('Save');
      fireEvent.click(saveButton);
      await waitForDomChange();
      saveButton = queryByText('Save');

      expect(saveButton).not.toBeDisabled();
    });

    it('enables cancel button after updateUser api call fails', async () => {
      const {queryByText} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockRejectedValue(mockFailUpdateUser);

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);
      await waitForDomChange();
      const cancelButton = queryByText('Cancel');

      expect(cancelButton).not.toBeDisabled();
    });

    it('displays the selected image in edit mode', async () => {
      const {container} = await setupForEdit();

      const uploadInput = container.querySelector('input[type="file"]');
      const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
      fireEvent.change(uploadInput, {target: {files: [file]}});

      await waitForDomChange();

      const image = container.querySelector('img');
      expect(image.src).toContain('data:image/png;base64');
    });

    it('returns back to original image even the new image is added to upload box but cancelled', async () => {
      const {queryByText, container} = await setupForEdit();

      const uploadInput = container.querySelector('input[type="file"]');
      const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
      fireEvent.change(uploadInput, {target: {files: [file]}});

      await waitForDomChange();

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      const image = container.querySelector('img');
      expect(image.src).toContain('/images/profile/profile1.png');
    });

    it('does not throw error after file not selected', async () => {
      const {container} = await setupForEdit();
      const uploadInput = container.querySelector('input[type="file"]');
      expect(() => fireEvent.change(uploadInput, {target: {files: []}})).not.toThrow();
    });

    it('calls updateUser api with request body having new image without data:image/png;base64', async () => {
      const {container, queryByText} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      const uploadInput = container.querySelector('input[type="file"]');
      const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
      fireEvent.change(uploadInput, {target: {files: [file]}});

      await waitForDomChange();

      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      const requestBody = apiCalls.updateUser.mock.calls[0][1];

      expect(requestBody.image).not.toContain('data:image/png;base64');
    });

    it('returns the last updated image when image is change for another time but cancelled', async () => {
      const {container, queryByText} = await setupForEdit();
      apiCalls.updateUser = jest.fn().mockResolvedValue(mockSuccessUpdateUser);

      let uploadInput = container.querySelector('input[type="file"]');
      const file = new File(['dummy content'], 'example.png', {type: 'image/png'});
      fireEvent.change(uploadInput, {target: {files: [file]}});

      await waitForDomChange();
      const saveButton = queryByText('Save');
      fireEvent.click(saveButton);

      const editButtonAfterClickingSave = await waitForElement(() => queryByText('Edit'));
      fireEvent.click(editButtonAfterClickingSave);

      uploadInput = container.querySelector('input[type="file"]');
      const newFile = new File(['another dummy content'], 'example2.png', {type: 'image/png'});
      fireEvent.change(uploadInput, {target: {files: [newFile]}});

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      const img = container.querySelector('img');
      expect(img.src).toContain('/images/profile/profile1-update.png');
    });

  });
});

console.error = () => {}
