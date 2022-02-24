import { LOCALE_STORAGE_USER_KEY } from '../constants';

export const getUser = () => {
  const user = window.localStorage.getItem(LOCALE_STORAGE_USER_KEY);
  return JSON.parse(user);
};
