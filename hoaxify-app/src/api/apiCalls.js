import axios from 'axios';
import {endpoint} from "../environment";

export const signup = (user) => {
  return axios.post(endpoint('/api/v1/users'), user, {
    headers: {
      'Accept-Language': 'en'
    }
  });
}
