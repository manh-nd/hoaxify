const initialState = {
  id: 0,
  displayName: '',
  username: '',
  image: '',
  password: '',
  isLoggedIn: false,
};

export default function authReducer(state = initialState, action) {
  switch (action.type) {
    case 'LOGOUT_SUCCESS':
      return {...initialState};
    case 'LOGIN_SUCCESS':
      return {
        ...action.payload,
        isLoggedIn: true
      };
    case 'SIGN_UP_SUCCESS':
      return {
        ...action.payload,
        isLoggedIn: true
      };
    default:
      return state;
  }
}
