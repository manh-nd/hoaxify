import React from "react";
import {render} from "@testing-library/react";
import * as apiCalls from '../api/apiCalls';
import HoaxFeed from "./HoaxFeed";
import {waitForDomChange, waitForElement} from "@testing-library/dom";
import HoaxView from "./HoaxView";
import {MemoryRouter} from "react-router-dom";

const mockEmptyResponse = {
  data: {
    content: []
  }
}

const mockSuccessGetHoaxesSinglePage = {
  data: {
    content: [
      {
        content: "This is the latest hoax",
        id: 1,
        timestamp: 1593665647637,
        user: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      },
    ],
    first: true,
    last: true,
    totalPages: 1,
    size: 1
  }
}

const setup = (props) => {
  return (
    render(<MemoryRouter><HoaxFeed {...props} /></MemoryRouter>)
  );
}

describe('HoaxFeed', () => {

  describe('lifecycle', () => {

    it('calls loadHoaxes when it is rendered', () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      setup();
      expect(apiCalls.loadHoaxes).toHaveBeenCalled();
    });

    it('calls loadHoaxes with user parameter when it is rendered with user property', () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      setup({user: 'user1'});
      expect(apiCalls.loadHoaxes).toHaveBeenCalledWith('user1');
    });

    it('calls loadHoaxes without user parameter when it is rendered without user property', () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      setup();
      const parameter = apiCalls.loadHoaxes.mock.calls[0][0];
      expect(parameter).toBeUndefined();
    });

  });

  describe('Layout', () => {

    it('displays no hoax message when response has empty page', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      const {queryByText} = setup();
      const message = await waitForElement(() => queryByText('There are no hoaxes'));
      expect(message).toBeInTheDocument();
    });

    it('does not display no hoax message when the response has page of hoax', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesSinglePage);
      const {queryByText} = setup();
      await waitForDomChange();
      const message = queryByText('There are no hoaxes');
      expect(message).not.toBeInTheDocument();
    });

    it('displays the spinner when loading hoaxes', async () => {
      apiCalls.loadHoaxes = jest.fn().mockImplementation(
        () => new Promise(
          (resolve) => setTimeout(() => resolve(mockSuccessGetHoaxesSinglePage), 300)
        )
      );
      const {queryByText} = setup();
      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });

    it('displays hoax content', async () => {
      apiCalls.loadHoaxes = jest.fn().mockImplementation(
        () => new Promise(
          (resolve) => setTimeout(() => resolve(mockSuccessGetHoaxesSinglePage), 300)
        )
      );
      const {queryByText} = setup();
      const content = await waitForElement(() => queryByText('This is the latest hoax'));
      expect(content).toBeInTheDocument();
    });
  });

});

console.error = () => {}
