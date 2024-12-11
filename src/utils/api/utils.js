import { JSON_UTF8_HEADER } from '../constants';

export const getSecureHeader = token =>
  token
    ? {
        Authorization: `Bearer ${token.accessToken}`,
      }
    : {};

export const getHeader = token => ({
  ...getSecureHeader(token),
  Accept: JSON_UTF8_HEADER,
});
