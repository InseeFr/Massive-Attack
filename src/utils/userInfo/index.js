import { LOC_STOR_USER_KEY } from '../constants';

export const getUser = () => {
  const user = window.localStorage.getItem(LOC_STOR_USER_KEY);
  return JSON.parse(user);
};
