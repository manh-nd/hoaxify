import React from "react";
import {render} from "@testing-library/react";
import HoaxView from "./HoaxView";
import {MemoryRouter} from "react-router-dom";

const setup = () => {
  const oneMinute = 60 * 1000;
  const date = new Date(new Date() - oneMinute);
  const hoax = {
    id: 1,
    content: 'This is the first hoax',
    timestamp: date,
    user: {
      id: 1,
      username: 'user1',
      displayName: 'display1',
      image: 'profile1.png'
    }
  };
  return (
    render(
      <MemoryRouter>
        <HoaxView hoax={hoax}/>
      </MemoryRouter>
    )
  );
}

describe('HoaxView', () => {

  describe('Layout', () => {

    it('displays hoax content', () => {
      const {queryByText} = setup();
      const content = queryByText('This is the first hoax');
      expect(content).toBeInTheDocument();
    });

    it('displays user image', () => {
      const {container} = setup();
      const img = container.querySelector('img');
      expect(img.src).toContain('/images/profile/profile1.png');
    });

    it('displays displayName@username', () => {
      const {queryByText} = setup();
      const userInfo = queryByText('display1@user1');
      expect(userInfo).toBeInTheDocument();
    });

    it('displays relative time', () => {
      const {queryByText} = setup();
      const time = queryByText('1 minute ago');
      expect(time).toBeInTheDocument();
    });

    it('has link to user page', () => {
      const {container} = setup();
      const anchor = container.querySelector('a');
      expect(anchor.getAttribute('href')).toBe('/user1');
    });

  });

});
