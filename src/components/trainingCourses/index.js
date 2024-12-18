import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { deleteCampaign, getCampaigns } from '../../utils/api/massive-attack-api';
import { useTranslation } from 'react-i18next';

import { AppContext } from '../app/App';
import DeleteIcon from '@material-ui/icons/Delete';
import Preloader from '../common/Preloader';
import { useIsAuthenticated } from 'utils/authentication/useAuth';
import { LOC_STOR_API_URL_KEY } from 'utils/constants';

const useStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: '1em',
  },
  dialogContent: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  cancelButton: {
    marginRight: theme.spacing(2),
  },
}));

const TrainingCourses = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { tokens } = useIsAuthenticated();

  const { organisationalUnit, isAdmin = false } = useContext(AppContext);
  const [campaigns, setCampaigns] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState();
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const MASSIVE_ATTACK_API_URL = window.localStorage.getItem(LOC_STOR_API_URL_KEY);

  useEffect(() => {
    const isVisibleCampaign = camp => {
      if (isAdmin) return true;
      const { id } = camp;
      const [, , orgaUnit] = id.split('_');

      return orgaUnit === organisationalUnit?.id;
    };

    setFilteredCamps(
      campaigns.filter(({ id }) => id.includes('_')).filter(camp => isVisibleCampaign(camp))
    );
  }, [campaigns, organisationalUnit?.id, isAdmin]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const camps = await getCampaigns(
        MASSIVE_ATTACK_API_URL,
        tokens,

        isAdmin
      );
      setCampaigns(await camps.data);
    };
    fetchCampaigns();
  }, [isAdmin, tokens, MASSIVE_ATTACK_API_URL]);

  useEffect(() => {
    const getTimestamp = id => id.split('_')[3];
    const getOrganisationalUnit = id => id.split('_')[2];
    const getType = id => id.split('_')[1];

    const buildSessions = camps => {
      const buildSession = timeStampType => {
        const [timeStamp, type] = timeStampType.split('_');
        const timedCampaigns = camps
          .map(camp => {
            const { id } = camp;
            const parts = id.split('_');
            const trainingSessionName = parts?.[4] ?? ''; // Extract campaign name if available
            return { ...camp, time: getTimestamp(id), type: getType(id), trainingSessionName };
          })
          .filter(camp => camp.time === timeStamp && camp.type === type);
        const sessionType = timedCampaigns[0].type;
        const sessionOrganisationUnit = getOrganisationalUnit(timedCampaigns[0].id);

        return {
          timeStamp,
          campaigns: timedCampaigns,
          type: sessionType,
          organisationUnit: sessionOrganisationUnit,
        };
      };

      const timestamps = camps.map(camp => camp.id).map(id => getTimestamp(id) + '_' + getType(id));
      const uniqTimestamps = [...new Set(timestamps)];

      return uniqTimestamps.map(time => buildSession(time));
    };
    setSessions(buildSessions(filteredCamps));
  }, [filteredCamps]);

  const generateDeleteMessage = sessionToDelete => {
    const { timeStamp, campaigns } = sessionToDelete;

    // Convert timestamp
    const date = new Date(parseInt(timeStamp));
    const dateString = `${date.toLocaleDateString()} ${date.getHours()}h${date.getMinutes()}`;
    const trainingSessionLabel = campaigns.length > 0 ? campaigns[0].label : '';
    const trainingSessionName = campaigns.length > 0 ? campaigns[0].trainingSessionName : '';
    return `${t('RemovalOfTraining')} "${trainingSessionLabel}" ${t(
      'WithTheLabel'
    )} "${trainingSessionName}" ${t('ScheduledOn')} ${dateString}`;
  };

  const deleteCampaignById = id => {
    return deleteCampaign(MASSIVE_ATTACK_API_URL, tokens)(id);
  };

  const deleteCampaignsBySession = session => {
    const campaignsToDelete = session.campaigns;
    setWaiting(true);
    setCampaigns(campaigns.filter(camp => !campaignsToDelete.map(c => c.id).includes(camp.id)));
    const promises = campaignsToDelete.map(camp => deleteCampaignById(camp.id));
    Promise.all(promises).then(() => setWaiting(false));
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const confirmDeletion = () => {
    deleteCampaignsBySession(sessionToDelete);
    handleClose();
  };

  const selectSession = session => {
    setSessionToDelete(session);
    setOpenModal(true);
  };

  return (
    <>
      {waiting && <Preloader message="Patientez" />}

      {!waiting && (
        <>
          <Typography variant="h6">{t('ListOfTrainingSessions')}</Typography>
          <TableContainer component={Paper}>
            <Table aria-label="training courses table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">{t('TrainingLabel')} </TableCell>
                  <TableCell align="center">{t('ReferenceDate')}</TableCell>
                  <TableCell align="center">{t('OrganizationalUnit')}</TableCell>
                  <TableCell align="center">{t('TypeOfTraining')}</TableCell>
                  <TableCell align="center">{t('NumberOfCampaigns')}</TableCell>
                  <TableCell align="center">{t('Delete')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(session => {
                  const date = new Date(parseInt(session.timeStamp));
                  const dateString = `${date.toLocaleDateString()} ${date.getHours()}h${date.getMinutes()}`;
                  return (
                    <TableRow key={session.timeStamp}>
                      <TableCell align="center">
                        {session.campaigns.length > 0 &&
                        session.campaigns[0].trainingSessionName !== ''
                          ? session.campaigns[0].trainingSessionName
                          : ''}
                      </TableCell>
                      <TableCell align="center">{dateString}</TableCell>
                      <TableCell align="center">{session.organisationUnit}</TableCell>
                      <TableCell align="center">
                        {session.type === 'I' ? 'Collecte' : 'Gestion'}
                      </TableCell>
                      <TableCell align="center">{session.campaigns.length}</TableCell>
                      <TableCell align="center">
                        <IconButton aria-label="delete" onClick={() => selectSession(session)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Dialog onClose={handleClose} open={openModal}>
            <div className={classes.dialogContent}>
              <Typography variant="h6">
                {sessionToDelete && generateDeleteMessage(sessionToDelete)}
              </Typography>
              <div className={classes.row}>
                <Button variant="outlined" className={classes.cancelButton} onClick={handleClose}>
                  {t('Cancel')}
                </Button>
                <Button variant="contained" color="primary" onClick={confirmDeletion}>
                  {t('Validate')}
                </Button>
              </div>
            </div>
          </Dialog>
        </>
      )}
    </>
  );
};

export default TrainingCourses;
