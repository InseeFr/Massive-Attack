import {
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import React, { useContext, useEffect, useState } from 'react';
import {
  getHours,
  getMilliseconds,
  getMinutes,
  getSeconds,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from 'date-fns';
import {
  getOrganisationUnits,
  getTrainingSessions,
  postTrainingSession,
} from '../../utils/api/massive-attack-api';
import { handleCSVUpload } from './CsvUploader';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import { AppContext } from '../app/App';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import Preloader from '../common/Preloader';
import Select from '@material-ui/core/Select';
import { getConfiguration } from '../../utils/configuration';

const useStyles = makeStyles(theme => ({
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'auto',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    marginTop: '1em',
    marginBottom: '1em',
  },
  invalid: {
    color: 'red',
  },
  title: {
    fontWeight: 'bold',
    marginRight: '1em',
  },
  alertContainer: {
    width: 'fit-content',
    margin: theme.spacing(2, 0, 2, 2),
  },
  csvImport: {
    margin: theme.spacing(2, 0, 2, 0),
    display: 'flex',
  },
}));

const Requester = () => {
  const classes = useStyles();

  const defaultValue = { id: 'default', ou: { id: 'unknown', label: 'Select...' } };
  const {
    organisationalUnit: contextOU,
    isAdmin,
    dateReference,
    setDateReference,
    campaignLabel,
    setCampaignLabel,
    campaignId,
    setCampaignId,
    organisationalUnit,
    setOrganisationalUnit,
    interviewers,
    setInterviewers,
    sessionType,
    setSessionType,
    error,
    setError,
    organisationalUnits,
    setOrganisationalUnits,
    availableSessions,
    setAvailableSessions,
  } = useContext(AppContext);
  const [response, setResponse] = useState(undefined);
  const [waiting, setWaiting] = useState(false);
  const [invalidValues, setInvalidValues] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [successMessage, setSuccessMessage] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [filteredValue, setFilteredValue] = useState('');

  const showAlert = (message, severity) => {
    const newAlert = { message, severity };
    setAlerts(prevAlerts => [...prevAlerts, newAlert]);

    const timeoutId = setTimeout(() => {
      setAlerts(prevAlerts => prevAlerts.filter(alert => alert !== newAlert));
    }, 5000);
    newAlert.timeoutId = timeoutId;
  };

  const addInterviewer = interviewerId => {
    if (!interviewers.map(inter => inter.id).includes(interviewerId.toUpperCase()))
      setInterviewers([...interviewers, { id: interviewerId, index: interviewers.length }]);
  };

  useEffect(() => {
    const getSessions = async () => {
      const { MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM } = await getConfiguration();
      let tempError;
      const sessions = await getTrainingSessions(
        MASSIVE_ATTACK_API_URL,
        AUTHENTICATION_MODE,
        PLATEFORM
      ).catch(() => {
        tempError = true;
        setError(true);
      });
      setAvailableSessions(tempError ? undefined : await sessions.data);
    };
    getSessions();
  }, [setError, setAvailableSessions]);

  useEffect(() => {
    if (!organisationalUnit) {
      setOrganisationalUnit(contextOU);
    }
  }, [organisationalUnit, contextOU, setOrganisationalUnit]);

  const removeInterviewer = interviewerIndex => {
    setInterviewers(
      interviewers
        .filter(i => {
          const { index } = i;
          return index !== interviewerIndex;
        })
        .map((inter, index) => ({ ...inter, index }))
    );
  };

  const updateInterviewer = (newValue, index) => {
    const values = interviewers
      .map(inter => {
        return inter.index === index
          ? {
              ...inter,
              id: newValue
                .trim()
                .substring(0, 6)
                .toUpperCase(),
            }
          : inter;
      })
      .map(inter => inter.id);
    const uniqValues = [...new Set(values)];

    setInterviewers(uniqValues.map((val, index) => ({ id: val, index: index })));
  };

  const constructParamsURL = () => {
    const interviewersParamUrl = interviewers.map(inter => `&interviewers=${inter.id}`).join('');
    return `?campaignId=${campaignId.label}&campaignLabel=${campaignLabel}&organisationUnitId=${organisationalUnit.id}&dateReference=${dateReference}${interviewersParamUrl}`;
  };
  const call = async () => {
    setDateReference(dateReference + 1);
    setWaiting(true);
    const { MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM } = await getConfiguration();
    if (campaignLabel.length > 10) {
      setCampaignLabel(campaignLabel.substring(0, 10));
    }
    const parametrizedUrl =
      MASSIVE_ATTACK_API_URL + '/massive-attack/api/training-course' + constructParamsURL();
    const callResponse = await postTrainingSession(
      parametrizedUrl,
      AUTHENTICATION_MODE,
      PLATEFORM
    ).catch(e => {
      setError(true);
      showAlert('An error occurred — <strong>Please contact support.', 'error');
      console.error(error);
      console.error(invalidValues);
      console.log(e);
    });
    setWaiting(false);
    setResponse(await callResponse?.data.campaign);
    // to prevent sending another session with the same timestamp
    console.error(successMessage);
    showAlert('The training session was a success!', 'success');
    setCampaignId('default');
    setInterviewers([{ id: '', index: 0 }]);
  };

  useEffect(() => {
    const getOUs = async () => {
      const { MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM } = await getConfiguration();
      let tempError;
      const ous = await getOrganisationUnits(
        MASSIVE_ATTACK_API_URL,
        AUTHENTICATION_MODE,
        PLATEFORM
      ).catch(() => {
        tempError = true;
        setError(true);
      });
      setOrganisationalUnits(tempError ? undefined : await ous.data);
    };
    getOUs();
  }, [setError, setOrganisationalUnits]);

  const updateDateReference = stringDate => {
    let newDate = new Date(stringDate);
    const oldDate = new Date(dateReference);
    const ms = getMilliseconds(oldDate);
    const sec = getSeconds(oldDate);
    const min = getMinutes(oldDate);
    const hours = getHours(oldDate);
    newDate = setMilliseconds(newDate, ms);
    newDate = setSeconds(newDate, sec);
    newDate = setMinutes(newDate, min);
    newDate = setHours(newDate, hours);
    setDateReference(newDate.getTime());
  };
  const checkValidity = () => {
    switch (sessionType) {
      case 'INTERVIEWER':
        return interviewers.map(int => int.id).filter(int => int.trim().length > 0).length > 0;
      case 'MANAGER':
        return true;
      default:
        return false;
    }
  };

  const selectedOU =
    organisationalUnits?.[organisationalUnits?.map(ou => ou.id).indexOf(organisationalUnit?.id)] ??
    defaultValue.ou;

  const selectedSession =
    availableSessions?.[
      availableSessions?.map(session => session.label).indexOf(campaignId.label)
    ] ?? defaultValue.id;
  return (
    <div className={classes.column}>
      {waiting && <Preloader message="Patientez" />}
      {organisationalUnit && (
        <>
          <div className={classes.row}>
            <Typography className={classes.title}>Pôle</Typography>
            <Select
              value={selectedOU}
              required
              disabled={!isAdmin}
              error={organisationalUnit === undefined}
              onChange={event => setOrganisationalUnit(event.target.value)}
            >
              {organisationalUnits?.map(ou => (
                <MenuItem value={ou} key={ou.id}>
                  {ou.label}
                </MenuItem>
              ))}
            </Select>
          </div>
          <Divider className={classes.divider} />
          <TextField
            required
            label="Label de la formation (10 caractères maximum)"
            error={campaignLabel === ''}
            onChange={event => {
              const inputValue = event.target.value;
              const filteredInput = inputValue
                .replace(/_/g, '')
                .replace(/ /g, '')
                .replace(/\//g, '')
                .toUpperCase();
              setFilteredValue(filteredInput);
              setCampaignLabel(filteredInput);
            }}
            value={filteredValue}
          />
          <Divider className={classes.divider} />
          <Select
            value={selectedSession}
            required
            error={campaignId === defaultValue.id}
            onChange={event => {
              setCampaignId(event.target.value);
              setSessionType(event.target.value.type);
            }}
          >
            <MenuItem value={defaultValue.id} selected disabled>
              Choisissez un scénario de formation
            </MenuItem>
            {availableSessions?.map(session => (
              <MenuItem value={session} key={session.label}>
                {session.label}
              </MenuItem>
            ))}
          </Select>
          <Divider className={classes.divider} />
          <TextField
            id="date"
            label="Date de référence"
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={new Date(dateReference).toISOString().slice(0, 10)}
            onChange={event => updateDateReference(event.target.value)}
          />
          <Divider className={classes.divider} />
          <Typography className={classes.title}>Liste des stagiaires</Typography>
          <div className={classes.csvImport}>
            <Typography className={classes.title}>
              Importer une liste de stagiaires par fichier CSV
            </Typography>
            <input
              type="file"
              accept=".csv"
              onChange={event =>
                handleCSVUpload(event, setInterviewers, setInvalidValues, showAlert)
              }
            />
          </div>
          {interviewers.map(inter => (
            <div className={classes.row} key={inter.index}>
              <TextField
                required
                id="standard-required"
                variant="outlined"
                placeholder="IDEP"
                value={inter.id}
                onChange={event => updateInterviewer(event.target.value, inter.index)}
              />
              <IconButton
                color="secondary"
                aria-label="remove interviewer"
                component="span"
                onClick={() => removeInterviewer(inter.index)}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))}
          <IconButton
            color="secondary"
            aria-label="add interviewer"
            component="span"
            onClick={() => addInterviewer('')}
          >
            <AddCircleIcon />
          </IconButton>
          {alerts.map((alert, index) => (
            <Alert key={index} className={classes.alertContainer} severity={alert.severity}>
              {alert.message}
            </Alert>
          ))}
          <Divider className={classes.divider} />
          <Button
            disabled={waiting || !checkValidity() || filteredValue.length === 0}
            variant="contained"
            onClick={() => call()}
          >
            Load Scenario
          </Button>
          {response && <div>{`Result: ${response}`}</div>}
        </>
      )}
    </div>
  );
};

export default Requester;
