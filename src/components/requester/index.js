import {
  Divider,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core';
import React, { useContext } from 'react';
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
import { getTrainingSessions, postTrainingSession } from '../../utils/api/massive-attack-api';

import AddCircleIcon from '@material-ui/icons/AddCircle';
import { AppContext } from '../app/App';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import Preloader from '../common/Preloader';
import Select from '@material-ui/core/Select';
import { getConfiguration } from '../../utils/configuration';

const useStyles = makeStyles(() => ({
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
}));

const Requester = () => {
  const classes = useStyles();

  const defaultValue = { campaignId: 'default' };

  const { organisationalUnit } = useContext(AppContext);
  const [error, setError] = React.useState(undefined);
  const [response, setResponse] = React.useState(undefined);
  const [waiting, setWaiting] = React.useState(false);
  const [availableSessions, setAvailableSessions] = React.useState(undefined);

  const [campaignId, setCampaignId] = React.useState(defaultValue.campaignId);
  const [campaignLabel, setCampaignLabel] = React.useState('');
  const [dateReference, setDateReference] = React.useState(new Date().getTime());
  const [interviewers, setInterviewers] = React.useState([{ id: '', index: 0 }]);

  const addInterviewer = interviewerId => {
    if (!interviewers.map(inter => inter.id).includes(interviewerId.toUpperCase()))
      setInterviewers([...interviewers, { id: interviewerId, index: interviewers.length }]);
  };

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
        return inter.index === index ? { ...inter, id: newValue.trim().toUpperCase() } : inter;
      })
      .map(inter => inter.id);
    const uniqValues = [...new Set(values)];

    setInterviewers(uniqValues.map((val, index) => ({ id: val, index: index })));
  };

  const constructParamsURL = () => {
    const interviewersParamUrl = interviewers.map(inter => `&interviewers=${inter.id}`).join('');
    return `?campaignId=${campaignId}&campaignLabel=${campaignLabel}&dateReference=${dateReference}${interviewersParamUrl}`;
  };

  const call = async () => {
    setWaiting(true);
    const { MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM } = await getConfiguration();
    const parametrizedUrl =
      MASSIVE_ATTACK_API_URL + '/massive-attack/api/training-course' + constructParamsURL();
    const callResponse = await postTrainingSession(
      parametrizedUrl,
      AUTHENTICATION_MODE,
      PLATEFORM
    ).catch(e => {
      setError(true);
      console.log(e);
    });
    setWaiting(false);
    setResponse(await callResponse?.data.campaign);
    // to prevent sending another session with same timestamp
    setDateReference(new Date().getTime());
    setCampaignId('default');
    setInterviewers([{ id: '', index: 0 }]);
  };

  React.useEffect(() => {
    const getData = async () => {
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
    getData();
  }, []);

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

  return (
    <div className={classes.column}>
      {waiting && <Preloader message="Patientez" />}
      {organisationalUnit && (
        <>
          <Typography>{`Pôle : ${organisationalUnit.label}`}</Typography>
          <Divider className={classes.divider} />
          <TextField
            required
            label="Label de la formation"
            error={campaignLabel === ''}
            onChange={event => setCampaignLabel(event.target.value)}
          />
          <Divider className={classes.divider} />
          <Select
            value={campaignId}
            required
            error={campaignId === defaultValue.campaignId}
            onChange={event => setCampaignId(event.target.value)}
          >
            <MenuItem value={defaultValue.campaignId} selected disabled>
              Choisissez un scénario de formation
            </MenuItem>
            {availableSessions?.map(session => (
              <MenuItem value={session.label} key={session.label}>
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
          <Typography>Liste des stagiaires</Typography>
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
          <Divider className={classes.divider} />
          <Button disabled={waiting} variant="contained" onClick={() => call()}>
            Charger un scénario{' '}
          </Button>
          {error && <div>An error occured, sorry </div>}
          {response && <div>{`Résultat : ${response}`}</div>}
        </>
      )}
    </div>
  );
};

export default Requester;
