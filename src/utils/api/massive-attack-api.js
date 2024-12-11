import { getHeader } from './utils';

import Axios from 'axios';

export const getTrainingSessions = async (urlSabianeData, tokens) => {
  try {
    const response = await Axios.get(
      `${urlSabianeData}/massive-attack/api/training-course-scenario`,
      {
        headers: getHeader(tokens),
      }
    );
    return response; // Resolves the promise with the response
  } catch (error) {
    // Checks if there is an error response and extracts a meaningful message
    const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
    throw new Error(`Failed to fetch training sessions: ${errorMessage}`);
  }
};

export const postTrainingSession = async (urlSabianeData, tokens) =>
  new Promise((resolve, reject) => {
    Axios.post(
      urlSabianeData,
      {},
      {
        headers: getHeader(tokens),
      }
    )
      .then(res => resolve(res))
      .catch(e => reject(new Error(`Failed to post training session : ${e.message}`)));
  });

export const getUserOrganisationalUnit = async (urlSabianeData, token) =>
  new Promise((resolve, reject) => {
    Axios.get(`${urlSabianeData}/massive-attack/api/user/organisationUnit`, {
      headers: getHeader(token),
    })
      .then(res => resolve(res))
      .catch(e => {
        reject(new Error(`Failed to fetch user organisationUnit : ${e.toJSON()}`));
      });
  });

export const getCampaigns = async (urlSabianeData, token, admin = false) =>
  new Promise((resolve, reject) => {
    Axios.get(`${urlSabianeData}/massive-attack/api/training-courses`, {
      headers: getHeader(token),
      params: { admin },
    })
      .then(res => resolve(res))
      .catch(e => {
        reject(new Error(`Failed to fetch training courses : ${e}`));
      });
  });

export const deleteCampaign = (urlSabianeData, token) => async id =>
  new Promise((resolve, reject) => {
    Axios.delete(`${urlSabianeData}/massive-attack/api/campaign/${id}`, {
      headers: getHeader(token),
    })
      .then(res => resolve(res))
      .catch(e => reject(new Error(`Failed to delete campaign : ${e}`)));
  });

export const getOrganisationUnits = async (urlSabianeData, token) =>
  new Promise((resolve, reject) => {
    Axios.get(`${urlSabianeData}/massive-attack/api/organisation-units`, {
      headers: getHeader(token),
    })
      .then(res => resolve(res))
      .catch(e => {
        reject(new Error(`Failed to fetch organisation units : ${e}`));
      });
  });
