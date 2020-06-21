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
