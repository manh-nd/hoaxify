import React from "react";
import {fireEvent, render} from "@testing-library/react";
import * as apiCalls from '../api/apiCalls';
import HoaxFeed from "./HoaxFeed";
import {waitForDomChange, waitForElement} from "@testing-library/dom";
import {MemoryRouter} from "react-router-dom";

const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const useFakeInterval = () => {
  window.setInterval = (callback, interval) => {
    timedFunction = callback;
  }
  window.clearInterval = () => {
    timedFunction = undefined;
  }
}

const useRealInterval = () => {
  window.setInterval = originalSetInterval;
  window.clearInterval = originalClearInterval;
}

const runTimer = () => {
  timedFunction && timedFunction();
}

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

const mockSuccessGetHoaxesMultiPage = {
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
    last: false,
    totalPages: 1,
    size: 1
  }
}

const mockSuccessGetHoaxesFirstMultiPage = {
  data: {
    content: [
      {
        content: "This is the latest hoax",
        id: 10,
        timestamp: 1593665647637,
        user: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      },
      {
        content: "This is hoax 9",
        id: 9,
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
    last: false,
    totalPages: 1,
    size: 1
  }
}

const mockSuccessGetHoaxesLastMultiPage = {
  data: {
    content: [
      {
        content: "This is the oldest hoax",
        id: 1,
        timestamp: 1593665647637,
        user: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      },
      {
        content: "This is hoax 9",
        id: 9,
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

const mockSuccessGetNewHoaxesList = {
  data: [
    {
      content: "This is the newest hoax",
      id: 21,
      timestamp: 1593665647637,
      user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
      }
    }
  ]
}

const mockSuccessGetHoaxesMiddleMultiPage = {
  data: {
    content: [
      {
        content: "This hoax is in middle page",
        id: 5,
        timestamp: 1593665647637,
        user: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      }
    ],
    first: false,
    last: false,
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

    it('calls loadNewHoaxCount with topHoaxId', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}});

      const {queryByText} = setup();
      await waitForElement(() => queryByText('There is 1 new hoax'));

      const firstParam = apiCalls.loadNewHoaxCount.mock.calls[0][0];
      expect(firstParam).toBe(10);
    });

    it('calls loadNewHoaxCount with topHoaxId and username when rendered with user property', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}});

      const {queryByText} = setup({user: 'user1'});
      await waitForDomChange();
      runTimer();

      await waitForElement(() => queryByText('There is 1 new hoax'));

      expect(apiCalls.loadNewHoaxCount).toHaveBeenCalledWith(10, 'user1');
      useRealInterval();
    });

    it('displays new hoax count as 1 after loadNewHoaxCount success', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}});

      const {queryByText} = setup({user: 'user1'});
      await waitForDomChange();
      runTimer();
      const newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));

      expect(newHoaxMessage).toBeInTheDocument();
      useRealInterval();
    });

    it('displays new hoax count constantly', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}});

      const {queryByText} = setup({user: 'user1'});
      await waitForDomChange();
      runTimer();

      await waitForElement(() => queryByText('There is 1 new hoax'));

      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 2}});
      runTimer();

      const newHoaxMessage = await waitForElement(() => queryByText('There is 2 new hoaxes'));
      expect(newHoaxMessage).toBeInTheDocument();
      useRealInterval();
    });

    it('does not call loadNewHoaxCount after component is unmounted', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}});

      const {queryByText, unmount} = setup({user: 'user1'});
      await waitForDomChange();
      runTimer();

      await waitForElement(() => queryByText('There is 1 new hoax'));
      unmount();
      expect(apiCalls.loadNewHoaxCount).toHaveBeenCalledTimes(1);
      useRealInterval();
    });

    it('displays new hoax count as 1 after loadNewHoaxCount success when user does not have hoaxes initialy', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockEmptyResponse);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}});

      const {queryByText} = setup({user: 'user1'});
      await waitForDomChange();
      runTimer();

      const newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      expect(newHoaxMessage).toBeInTheDocument();
      useRealInterval();
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

    it('displays Load More when there are next pages', async () => {
      apiCalls.loadHoaxes = jest.fn().mockImplementation(
        () => new Promise(
          (resolve) => setTimeout(() => resolve(mockSuccessGetHoaxesMultiPage), 300)
        )
      );
      const {queryByText} = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      expect(loadMore).toBeInTheDocument();
    });

  });

  describe('Interactions', () => {
    it('calls loadOldHoaxes with hoax id when clicking Load More', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadOldHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesLastMultiPage);

      const {queryByText} = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);

      const firstParameter = apiCalls.loadOldHoaxes.mock.calls[0][0];
      expect(firstParameter).toBe(9);
    });

    it('calls loadOldHoaxes with hoax id and username when clicking Load More when rendered with user property', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadOldHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesLastMultiPage);

      const {queryByText} = setup({user: 'user1'});
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);

      expect(apiCalls.loadOldHoaxes).toHaveBeenCalledWith(9, 'user1');
    });

    it('displays loaded old hoax when loadOldHoaxes api call success', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadOldHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesLastMultiPage);

      const {queryByText} = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);

      const oldHoax = await waitForElement(() => queryByText('This is the oldest hoax'));
      expect(oldHoax).toBeInTheDocument();
    });

    it('hides Load More when loadOldHoaxes api call returns last page', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadOldHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesLastMultiPage);

      const {queryByText} = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);

      const oldHoax = await waitForElement(() => queryByText('This is the oldest hoax'));
      expect(queryByText('Load More')).not.toBeInTheDocument();
    });

    it('does not allow loadOldHoaxes to be called when there is an active api call it', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadOldHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesLastMultiPage);

      const {queryByText} = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      fireEvent.click(loadMore);

      expect(apiCalls.loadOldHoaxes).toHaveBeenCalledTimes(1);
    });

    it('replaces Load More when spinner when there is an active api call it', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadOldHoaxes = jest.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve(mockSuccessGetHoaxesLastMultiPage), 300)
        )
      );

      const {queryByText} = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      const spinner = await waitForElement(() => queryByText('Loading...'));
      expect(spinner).toBeInTheDocument();
    });

    it('replaces spinner with Load More after active api call for loadOldHoaxes finishes with middle page response', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadOldHoaxes = jest.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve(mockSuccessGetHoaxesMiddleMultiPage), 300)
        )
      );

      const {queryByText} = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      await waitForElement(() => queryByText('This hoax is in middle page'));
      expect(queryByText('Loading...')).not.toBeInTheDocument();
      expect(queryByText('Load More')).toBeInTheDocument();
    });

    it('replaces spinner with Load More after active api call for loadOldHoaxes finishes with error', async () => {
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadOldHoaxes = jest.fn().mockImplementation(() =>
        new Promise((resolve, reject) =>
          setTimeout(() => reject({response: {data: {}}}), 300)
        )
      );

      const {queryByText} = setup();
      let loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);

      loadMore = await waitForElement(() => queryByText('Load More'));
      expect(loadMore).toBeInTheDocument();
    });

    it('calls loadNewHoaxes with hoax id when clicking New Hoax Count', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}})
      apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);

      const {queryByText} = setup();
      await waitForDomChange();
      runTimer();

      const newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      fireEvent.click(newHoaxMessage);

      const firstParameter = apiCalls.loadNewHoaxes.mock.calls[0][0];
      expect(firstParameter).toBe(10);
      useRealInterval();
    });

    it('calls loadNewHoaxes with hoax id and username when clicking New Hoax Count when rendered with user property', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}})
      apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);

      const {queryByText} = setup({user: 'user1'});
      await waitForDomChange();
      runTimer();

      const newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      fireEvent.click(newHoaxMessage);

      expect(apiCalls.loadNewHoaxes).toHaveBeenCalledWith(10, 'user1');
      useRealInterval();
    });

    it('displays loaded new hoax when loadNewHoaxes api call success', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}})
      apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);

      const {queryByText} = setup();
      await waitForDomChange();
      runTimer();

      const newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      fireEvent.click(newHoaxMessage);

      const newHoax = await waitForElement(() => queryByText('This is the newest hoax'));
      expect(newHoax).toBeInTheDocument();
      useRealInterval();
    });

    it('hides New Hoax Count when loadNewHoaxes api call success', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}})
      apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);

      const {queryByText} = setup();
      await waitForDomChange();
      runTimer();

      const newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      fireEvent.click(newHoaxMessage);

      await waitForElement(() => queryByText('This is the newest hoax'));
      expect(queryByText('There is 1 new hoax')).not.toBeInTheDocument();
      useRealInterval();
    });

    it('does not allow loadNewHoaxes to be called when there is an active api call it', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}})
      apiCalls.loadNewHoaxes = jest.fn().mockResolvedValue(mockSuccessGetNewHoaxesList);

      const {queryByText} = setup();
      await waitForDomChange();
      runTimer();

      const newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      fireEvent.click(newHoaxMessage);
      fireEvent.click(newHoaxMessage);

      expect(apiCalls.loadNewHoaxes).toHaveBeenCalledTimes(1);
      useRealInterval();
    });

    it('replaces There is 1 new hoax when spinner when there is an active api call it', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}})
      apiCalls.loadNewHoaxes = jest.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve(mockSuccessGetNewHoaxesList), 300)
        )
      );

      const {queryByText} = setup();
      await waitForDomChange();
      runTimer();

      const newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      fireEvent.click(newHoaxMessage);

      const spinner = await waitForElement(() => queryByText('Loading...'));
      expect(spinner).toBeInTheDocument();
      expect(queryByText('There is 1 new hoax')).not.toBeInTheDocument();
      useRealInterval();
    });

    it('remove Spinner and There is 1 new hoax after active api call for loadNewHoaxes finishes with success', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}})
      apiCalls.loadNewHoaxes = jest.fn().mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve(mockSuccessGetNewHoaxesList), 300)
        )
      );

      const {queryByText} = setup();
      await waitForDomChange();
      runTimer();

      const newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      fireEvent.click(newHoaxMessage);

      await waitForElement(() => queryByText('This is the newest hoax'));
      expect(queryByText('Loading...')).not.toBeInTheDocument();
      expect(queryByText('There is 1 new hoax')).not.toBeInTheDocument();
      useRealInterval();
    });

    it('replaces spinner with There is 1 new hoax after api call for loadNewHoaxes finishes with error', async () => {
      useFakeInterval();
      apiCalls.loadHoaxes = jest.fn().mockResolvedValue(mockSuccessGetHoaxesFirstMultiPage);
      apiCalls.loadNewHoaxCount = jest.fn().mockResolvedValue({data: {count: 1}})
      apiCalls.loadNewHoaxes = jest.fn().mockImplementation(() =>
        new Promise((resolve, reject) =>
          setTimeout(() => reject({response: {data: {}}}), 300)
        )
      );

      const {queryByText} = setup();
      await waitForDomChange();
      runTimer();

      let newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      fireEvent.click(newHoaxMessage);

      newHoaxMessage = await waitForElement(() => queryByText('There is 1 new hoax'));
      expect(newHoaxMessage).toBeInTheDocument();
      useRealInterval();
    });

  });

});

console.error = () => {
}
