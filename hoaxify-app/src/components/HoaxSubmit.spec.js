import React from "react";
import {fireEvent, render} from "@testing-library/react";
import {Provider} from "react-redux";
import HoaxSubmit from "./HoaxSubmit";
import {createStore} from "redux";
import authReducer from "../redux/authReducer";
import * as apiCalls from '../api/apiCalls';
import {waitForDomChange} from "@testing-library/dom";

const defaultState = {
  id: 1,
  displayName: 'display1',
  username: 'user1',
  image: 'profile1.png',
  password: 'P4ssword',
  isLoggedIn: true,
};

let store;

const setup = (state = defaultState) => {
  store = createStore(authReducer, state);
  return render(
    <Provider store={store}>
      <HoaxSubmit/>
    </Provider>
  )
}


describe('hoaxSubmit', () => {

  describe('Layout', () => {
    it('has textarea', () => {
      const {container} = setup();
      const textarea = container.querySelector('textarea')
      expect(textarea).toBeInTheDocument();
    });

    it('has image', () => {
      const {container} = setup();
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument();
    });

    it('displays textarea in 1 line', () => {
      const {container} = setup();
      const textarea = container.querySelector('textarea')
      expect(textarea.rows).toBe(1);
    });

    it('displays users image', () => {
      const {container} = setup();
      const img = container.querySelector('img')
      expect(img.src).toContain('/images/profile/' + defaultState.image);
    });
  });

  describe('Interactions', () => {
    it('displays 3 rows when focused to textarea', () => {
      const {container} = setup();
      const textarea = container.querySelector('textarea')
      fireEvent.focus(textarea);
      expect(textarea.rows).toBe(3);
    });

    it('displays hoaxify button when focused to texarea', () => {
      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea')
      fireEvent.focus(textarea);
      const hoaxifyButton = queryByText('Hoaxify')
      expect(hoaxifyButton).toBeInTheDocument();
    });

    it('displays cancel button when focused to texarea', () => {
      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea')
      fireEvent.focus(textarea);
      const cancelButton = queryByText('Cancel')
      expect(cancelButton).toBeInTheDocument();
    });

    it('does not display save button when not focused to texarea', () => {
      const {queryByText} = setup();
      const saveButton = queryByText('Hoaxify')
      expect(saveButton).not.toBeInTheDocument();
    });

    it('does not display cancel button when not focused to texarea', () => {
      const {queryByText} = setup();
      const cancelButton = queryByText('Cancel')
      expect(cancelButton).not.toBeInTheDocument();
    });

    it('returns back to unfocused state after clicking the cancel', () => {
      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea')
      fireEvent.focus(textarea);
      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);
      expect(queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('calls postHoax with hoax request object when clicking Hoaxify button', () => {
      apiCalls.postHoax = jest.fn().mockResolvedValue({});

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea')
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      expect(apiCalls.postHoax).toHaveBeenCalledWith({content: 'Test hoax content'});
    });

    it('clears content after successful postHoax action', async () => {
      apiCalls.postHoax = jest.fn().mockResolvedValue({});

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();

      expect(container.querySelector('textarea')).toHaveValue('');
    });

    it('clears content after clicking cancel', () => {
      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      expect(container.querySelector('textarea')).toHaveValue('');
    });

    it('disables Hoaxify button when there is postHoax api call', async () => {
      apiCalls.postHoax = jest.fn()
        .mockImplementation(() =>
          new Promise(resolve =>
            setTimeout(() => resolve({}),
              300)
          )
        );

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);
      fireEvent.click(hoaxifyButton);

      expect(apiCalls.postHoax).toHaveBeenCalledTimes(1);
    });

    it('disables Cancel button when there is postHoax api call', async () => {
      apiCalls.postHoax = jest.fn()
        .mockImplementation(() =>
          new Promise(resolve =>
            setTimeout(() => resolve({}),
              300)
          )
        );

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      expect(queryByText('Cancel')).toBeDisabled();
    });

    it('displays the spinner when there is postHoax api call', async () => {
      apiCalls.postHoax = jest.fn()
        .mockImplementation(() =>
          new Promise(resolve =>
            setTimeout(() => resolve({}),
              300)
          )
        );

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      const spinner = queryByText('Loading...');

      expect(spinner).toBeInTheDocument();
    });

    it('enables Hoaxify Button when postHoax api call fails', async () => {
      apiCalls.postHoax = jest.fn()
        .mockRejectedValue({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();

      expect(queryByText('Hoaxify')).not.toBeDisabled();
    });

    it('enables Cancel Button when postHoax api call fails', async () => {
      apiCalls.postHoax = jest.fn()
        .mockRejectedValue({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();

      expect(queryByText('Cancel')).not.toBeDisabled();
    });


    it('enables Hoaxify Button after successful postHoax action', async () => {
      apiCalls.postHoax = jest.fn().mockResolvedValue();

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();
      fireEvent.focus(container.querySelector('textarea'));

      expect(queryByText('Hoaxify')).not.toBeDisabled();
    });

    it('displays validationErrors for content', async () => {
      apiCalls.postHoax = jest.fn()
        .mockRejectedValue({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();

      const errorMessage = queryByText('It must have minimum 10 and maximum 5000 characters');
      expect(errorMessage).toBeInTheDocument();
    });

    it('clears validation error after clicking cancel', async () => {
      apiCalls.postHoax = jest.fn()
        .mockRejectedValue({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();

      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);

      const errorMessage = queryByText('It must have minimum 10 and maximum 5000 characters');
      expect(errorMessage).not.toBeInTheDocument();
    });

    it('clears validation error when change content', async () => {
      apiCalls.postHoax = jest.fn()
        .mockRejectedValue({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });

      const {container, queryByText} = setup();
      const textarea = container.querySelector('textarea');
      fireEvent.focus(textarea);
      fireEvent.change(textarea, {target: {value: 'Test hoax content'}});

      const hoaxifyButton = queryByText('Hoaxify');
      fireEvent.click(hoaxifyButton);

      await waitForDomChange();

      const textareaAfterClickHoaxifyButton = container.querySelector('textarea');
      fireEvent.focus(textareaAfterClickHoaxifyButton);
      fireEvent.change(textareaAfterClickHoaxifyButton, {target: {value: 'New test hoax content'}});

      const errorMessage = queryByText('It must have minimum 10 and maximum 5000 characters');
      expect(errorMessage).not.toBeInTheDocument();
    });

  });

});

console.error = () => {}
