import axios from 'axios';
import * as apiCalls from "./apiCalls";

describe('apiCalls', () => {

  describe('signup', () => {
    it('calls /api/v1/users', () => {
      const mockSignup = jest.fn();
      axios.post = mockSignup;
      apiCalls.signup();
      const path = mockSignup.mock.calls[0][0];
      expect(path).toBe('/api/v1/users');
    });
  });

  describe('login', () => {
    it('calls /api/v1/login', () => {
      const mockLogin = jest.fn();
      axios.post = mockLogin;
      apiCalls.login({username: 'test-user', password: 'P4ssword'});
      const path = mockLogin.mock.calls[0][0];
      expect(path).toBe('/api/v1/login');
    });
  });

  describe('listUser', () => {
    it('calls /api/v1/users?page=0&size=3 when no param no param provided for listUser', () => {
      const mockListUsers = jest.fn();
      axios.get = mockListUsers;
      apiCalls.listUsers();
      expect(mockListUsers).toHaveBeenCalledWith('/api/v1/users?page=0&size=3');
    });

    it('calls /api/v1/users?page=5&size=10 when corresponding params provided for listUser', () => {
      const mockListUsers = jest.fn();
      axios.get = mockListUsers;
      apiCalls.listUsers({page: 5, size: 10});
      expect(mockListUsers).toHaveBeenCalledWith('/api/v1/users?page=5&size=10');
    });

    it('calls /api/v1/users?page=5 when only page param provided for listUser', () => {
      const mockListUsers = jest.fn();
      axios.get = mockListUsers;
      apiCalls.listUsers({page: 5});
      expect(mockListUsers).toHaveBeenCalledWith('/api/v1/users?page=5&size=3');
    });

    it('calls /api/v1/users?size=5 when only size param provided for listUser', () => {
      const mockListUsers = jest.fn();
      axios.get = mockListUsers;
      apiCalls.listUsers({size: 5});
      expect(mockListUsers).toHaveBeenCalledWith('/api/v1/users?page=0&size=5');
    });
  });

  describe('getUser', () => {
    it('calls /api/v1/users/user5 when user5 is provided for getUser', () => {
      const mockGetUser = jest.fn();
      axios.get = mockGetUser;
      apiCalls.getUser('user5');
      expect(mockGetUser).toHaveBeenCalledWith('/api/v1/users/user5');
    });
  });

  describe('updateUser', () => {
    it('calls /api/v1/users/5 when 5 is provided for updateUser', () => {
      const mockUpdateUser = jest.fn();
      axios.put = mockUpdateUser;
      apiCalls.updateUser(5);
      const path = mockUpdateUser.mock.calls[0][0];
      expect(path).toBe('/api/v1/users/5');
    });
  });

  describe('postHoax', () => {
    it('calls /api/v1/hoaxes', () => {
      const mockPostHoax = jest.fn();
      axios.post = mockPostHoax;
      apiCalls.postHoax();
      const path = mockPostHoax.mock.calls[0][0];
      expect(path).toBe('/api/v1/hoaxes');
    });
  });

});
