import { authentication, getHeader } from './utils';

import Axios from 'axios';

export const getTrainingSessions = async (urlSabianeData, authenticationMode, pf) =>
  new Promise((resolve, reject) => {
    authentication(authenticationMode)
      .then(() => {
        Axios.get(`${urlSabianeData}/massive-attack/api/training-course-scenario`, {
          headers: getHeader(authenticationMode),
          params: { plateform: pf },
        })
          .then(res => resolve(res))
          .catch(e => {
            reject(new Error(`Failed to fetch training sessions : ${e}`));
          });
      })
      .catch(e => {
        reject(new Error(`Error during refreshToken : ${e.response.data.error.message}`));
      });
  });

export const postTrainingSession = async (urlSabianeData, authenticationMode, pf) =>
  new Promise((resolve, reject) => {
    authentication(authenticationMode)
      .then(() => {
        Axios.post(
          urlSabianeData,
          {},
          {
            headers: getHeader(authenticationMode),
            params: { plateform: pf },
          }
        )
          .then(res => resolve(res))
          .catch(e => reject(new Error(`Failed to post training session : ${e.message}`)));
      })
      .catch(e => reject(new Error(`Error during refreshToken : ${e.message}`)));
  });

export const getUserOrganisationalUnit = async (urlSabianeData, authenticationMode, pf) =>
  new Promise((resolve, reject) => {
    authentication(authenticationMode)
      .then(() => {
        Axios.get(`${urlSabianeData}/massive-attack/api/user/organisationUnit`, {
          headers: getHeader(authenticationMode),
          params: { plateform: pf },
        })
          .then(res => resolve(res))
          .catch(e => {
            reject(new Error(`Failed to fetch user organisationUnit : ${e.toJSON()}`));
          });
      })
      .catch(e => {
        console.log(e.toJSON());
        reject(new Error(`Error during refreshToken : ${e.response.data.error.message}`));
      });
  });

export const getCampaigns = async (urlSabianeData, authenticationMode, pf, admin = false) =>
  new Promise((resolve, reject) => {
    authentication(authenticationMode)
      .then(() => {
        Axios.get(`${urlSabianeData}/massive-attack/api/training-courses`, {
          headers: getHeader(authenticationMode),
          params: { plateform: pf, admin },
        })
          .then(res => resolve(res))
          .catch(e => {
            reject(new Error(`Failed to fetch training courses : ${e}`));
          });
      })
      .catch(e => {
        reject(new Error(`Error during refreshToken : ${e.response.data.error.message}`));
      });
  });

export const deleteCampaign = (urlSabianeData, authenticationMode, pf) => async id =>
  new Promise((resolve, reject) => {
    authentication(authenticationMode)
      .then(() => {
        Axios.delete(`${urlSabianeData}/massive-attack/api/campaign/${id}`, {
          headers: getHeader(authenticationMode),
          params: { plateform: pf },
        })
          .then(res => resolve(res))
          .catch(e => reject(new Error(`Failed to delete campaign : ${e}`)));
      })
      .catch(e => {
        reject(new Error(`Error during refreshToken : ${e.response.data.error.message}`));
      });
  });

export const getOrganisationUnits = async (urlSabianeData, authenticationMode, pf) =>
  new Promise((resolve, reject) => {
    authentication(authenticationMode)
      .then(() => {
        Axios.get(`${urlSabianeData}/massive-attack/api/organisation-units`, {
          headers: getHeader(authenticationMode),
          params: { plateform: pf },
        })
          .then(res => resolve(res))
          .catch(e => {
            reject(new Error(`Failed to fetch organisation units : ${e}`));
          });
      })
      .catch(e => {
        reject(new Error(`Error during refreshToken : ${e.response.data.error.message}`));
      });
  });
