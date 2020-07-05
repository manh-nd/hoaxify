import axios from 'axios';
import {endpoint} from "../environment";

export const signup = (user) => {
  return axios.post(endpoint('/api/v1/users'), user, {
    headers: {
      'Accept-Language': 'en'
    }
  });
}

export const login = (user) => {
  return axios.post(endpoint('/api/v1/login'), {}, {
    auth: user,
    headers: {
      'Accept-Language': 'en'
    }
  });
}

export const setAuthorizationHeader = ({username, password, isLoggedIn}) => {
  if (isLoggedIn) {
    axios.defaults.headers.common['Authorization'] = `Basic ${
      btoa(username + ':' + password)
    }`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

export function listUsers(param = {page: 0, size: 3}) {
  const path = `/api/v1/users?page=${param.page || 0}&size=${param.size || 3}`;
  return axios.get(endpoint(path));
}

export function getUser(username) {
  const path = `/api/v1/users/${username}`;
  return axios.get(endpoint(path));
}

export function updateUser(userId, body) {
  return axios.put(endpoint(`/api/v1/users/${userId}`), body, {
    headers: {
      'Accept-Language': 'en'
    }
  });
}

export function postHoax(hoax) {
  return axios.post(endpoint(`/api/v1/hoaxes`), hoax, {
    headers: {
      'Accept-Language': 'en'
    }
  });
}

export function loadHoaxes(username) {
  const basePath = username
    ? `/api/v1/users/${username}/hoaxes?page=0&size=5&sort=id,desc`
    : '/api/v1/hoaxes?page=0&size=5&sort=id,desc';

  return axios.get(endpoint(basePath), {
    headers: {
      'Accept-Language': 'en'
    }
  });
}

export function loadOldHoaxes(hoaxId, username) {
  const basePath = username
    ? `/api/v1/users/${username}/hoaxes/${hoaxId}?direction=before&page=0&size=5&sort=id,desc`
    : `/api/v1/hoaxes/${hoaxId}?direction=before&page=0&size=5&sort=id,desc`;

  return axios.get(endpoint(basePath), {
    headers: {
      'Accept-Language': 'en'
    }
  });
}

export function loadNewHoaxes(hoaxId, username) {
  const basePath = username
    ? `/api/v1/users/${username}/hoaxes/${hoaxId}?direction=after&sort=id,desc`
    : `/api/v1/hoaxes/${hoaxId}?direction=after&sort=id,desc`;

  return axios.get(endpoint(basePath), {
    headers: {
      'Accept-Language': 'en'
    }
  });
}

export function loadNewHoaxCount(hoaxId, username) {
  const basePath = username
    ? `/api/v1/users/${username}/hoaxes/${hoaxId}?direction=after&count=true`
    : `/api/v1/hoaxes/${hoaxId}?direction=after&count=true`;

  return axios.get(endpoint(basePath), {
    headers: {
      'Accept-Language': 'en'
    }
  });
}
