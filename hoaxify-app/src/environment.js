export const endpoint = (uri) => {
  return `${process.env.REACT_APP_API_URL}${uri}`;
};
