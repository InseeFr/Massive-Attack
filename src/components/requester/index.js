import {
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  makeStyles,
  Chip,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
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
import { useIsAuthenticated } from 'utils/authentication/useAuth';
import { LOC_STOR_API_URL_KEY } from 'utils/constants';

const useStyles = makeStyles(theme => ({
  importCsv: {
    border: 'none',
    background: '#3f51b5',
    padding: '10px 20px',
    borderRadius: ' 5px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.2s ease-in-out',
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '15px',
    marginTop: '0.6em',
    '&:hover': {
      background: '#303f9f',
    },
  },
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
  circleIcon: {
    fontSize: '1.5em',
  },
  title: {
    fontWeight: 'bold',
    marginRight: '1em',
  },
  input: {
    display: 'none',
  },
  dividerVertical: {
    backgroundColor: '#3f51b5',
    width: '0.05em',
  },
  interviewers: {
    display: 'flex',
    flexDirection: 'column',
  },
  alertContainer: {
    width: 'fit-content',
    margin: theme.spacing(2, 0, 2, 2),
  },
  csvImport: {
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  create: {
    display: 'flex',
    flexDirection: 'column',
  },
  chip: {
    margin: '1em 0 1em 0',
    width: 'fit-content',
    alignSelf: 'center',
  },
}));

const Requester = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { tokens } = useIsAuthenticated();

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
  const [alerts, setAlerts] = useState([]);
  const MASSIVE_ATTACK_API_URL = window.localStorage.getItem(LOC_STOR_API_URL_KEY);

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
      let tempError;
      const sessions = await getTrainingSessions(MASSIVE_ATTACK_API_URL, tokens).catch(() => {
        tempError = true;
        setError(true);
      });
      setAvailableSessions(tempError ? undefined : await sessions.data);
    };
    getSessions();
  }, [setError, setAvailableSessions, tokens, MASSIVE_ATTACK_API_URL]);

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
    const values = interviewers.map(inter => {
      return inter.index === index
        ? {
            ...inter,
            id: newValue
              .trim()
              .substring(0, 6)
              .toUpperCase(),
          }
        : inter;
    });
    const uniqueValues = [...new Set(values.map(inter => inter.id))];
    setInterviewers(uniqueValues.map((val, index) => ({ id: val, index: index })));
  };

  const constructParamsURL = () => {
    const interviewersParamUrl = interviewers.map(inter => `&interviewers=${inter.id}`).join('');
    return `?campaignId=${campaignId.label}&campaignLabel=${campaignLabel}&organisationUnitId=${organisationalUnit.id}&dateReference=${dateReference}${interviewersParamUrl}`;
  };
  const call = async () => {
    setDateReference(dateReference + 1);
    setWaiting(true);
    const parametrizedUrl =
      MASSIVE_ATTACK_API_URL + '/massive-attack/api/training-course' + constructParamsURL();
    const callResponse = await postTrainingSession(parametrizedUrl, tokens).catch(e => {
      setError(true);
      showAlert(t('ContactSupport'), 'error');
      console.error(invalidValues);
      console.log(e);
    });
    setWaiting(false);
    setResponse(await callResponse?.data.campaign);
    // to prevent sending another session with the same timestamp
    showAlert(t('TrainingSessionSuccess'), 'success');
    setCampaignId('default');
    setInterviewers([{ id: '', index: 0 }]);
  };

  useEffect(() => {
    const getOUs = async () => {
      let tempError;
      const ous = await getOrganisationUnits(MASSIVE_ATTACK_API_URL, tokens).catch(() => {
        tempError = true;
        setError(true);
      });
      setOrganisationalUnits(tempError ? undefined : await ous.data);
    };
    getOUs();
  }, [setError, setOrganisationalUnits, tokens, MASSIVE_ATTACK_API_URL]);

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
            <Typography className={classes.title}>{t('DivisionLabel')} </Typography>
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
            label={t('FormationLabel')}
            error={campaignLabel === ''}
            onChange={event => {
              const inputValue = event.target.value;
              const filteredInput = inputValue
                .replace(/_/g, '')
                .replace(/ /g, '')
                .replace(/\//g, '')
                .toUpperCase()
                .substring(0, 10);
              setCampaignLabel(filteredInput);
            }}
            value={campaignLabel}
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
              {t('ChoiceTrainingCourse')}
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
            label={t('ReferenceDate')}
            type="date"
            InputLabelProps={{
              shrink: true,
            }}
            value={new Date(dateReference).toISOString().slice(0, 10)}
            onChange={event => updateDateReference(event.target.value)}
          />
          <Divider className={classes.divider} />
          <div className={classes.wrapper}>
            <div className={classes.create}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                className={classes.button}
                startIcon={<AddCircleIcon />}
                onClick={() => addInterviewer('')}
              >
                {t('AddATrainee')}
              </Button>
              <Chip className={classes.chip} color="dark" label={t('Or')} />
              <div className={classes.csvImport}>
                <Typography className={classes.title}>{t('ImportTraineesList')}</Typography>
                <input
                  id="file-input"
                  className={classes.input}
                  type="file"
                  accept=".csv"
                  onChange={event =>
                    handleCSVUpload(event, setInterviewers, setInvalidValues, showAlert)
                  }
                />
                <label className={classes.importCsv} id="file-input-label" htmlFor="file-input">
                  <AddCircleIcon className={classes.circleIcon} /> {t('ImportYourCsv')}
                </label>
              </div>
            </div>
            <div className={classes.wrapperTrainees}>
              <Typography className={classes.title}>{t('TraineesList')}</Typography>
              <div className={classes.interviewers}>
                {interviewers.map(inter => (
                  <div key={inter.index}>
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
              </div>
            </div>
          </div>
          {alerts.map((alert, index) => (
            <Alert key={index} className={classes.alertContainer} severity={alert.severity}>
              {alert.message}
            </Alert>
          ))}
          <Divider className={classes.divider} />
          <Button
            disabled={waiting || !checkValidity() || campaignLabel.length === 0}
            variant="contained"
            onClick={() => call()}
          >
            {t('LoadScenarioButton')}
          </Button>
          {response && <div>{`Result: ${response}`}</div>}
        </>
      )}
    </div>
  );
};

export default Requester;
