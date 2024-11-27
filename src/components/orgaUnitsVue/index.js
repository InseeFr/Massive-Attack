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
import React, { useContext, useEffect, useState } from 'react';
import { deleteCampaign, getCampaigns } from '../../utils/api/massive-attack-api';

import { AppContext } from '../app/App';
import DeleteIcon from '@material-ui/icons/Delete';
import Preloader from '../common/Preloader';
import { useTranslation } from 'react-i18next';
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
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
  },
  cancelButton: {
    marginRight: theme.spacing(2),
  },
}));

export const OrganisationUnitsVue = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { tokens } = useIsAuthenticated();

  const { isAdmin = false } = useContext(AppContext);
  const [campaigns, setCampaigns] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState();
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const MASSIVE_ATTACK_API_URL = window.localStorage.getItem(LOC_STOR_API_URL_KEY);

  useEffect(() => {
    setFilteredCamps(campaigns.filter(({ id }) => id.includes('_')));
  }, [campaigns, isAdmin]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const camps = await getCampaigns(MASSIVE_ATTACK_API_URL, tokens, isAdmin);
      setCampaigns(await camps.data);
    };
    fetchCampaigns();
  }, [MASSIVE_ATTACK_API_URL, isAdmin, tokens]);

  useEffect(() => {
    const getOrganisationalUnit = id => id.split('_')[2];
    const getType = id => id.split('_')[1];

    const buildSessions = camps => {
      const buildSession = timeStampType => {
        const [ouid, type] = timeStampType.split('_');
        const ouIdedCampaigns = camps
          .map(camp => {
            const { id } = camp;
            return { ...camp, ouid: getOrganisationalUnit(id), type: getType(id) };
          })
          .filter(camp => camp.ouid === ouid && camp.type === type);
        const sessionType = ouIdedCampaigns[0].type;
        const sessionOrganisationUnit = getOrganisationalUnit(ouIdedCampaigns[0].id);

        return {
          ouid,
          campaigns: ouIdedCampaigns,
          type: sessionType,
          organisationUnit: sessionOrganisationUnit,
        };
      };

      const timestamps = camps
        .map(camp => camp.id)
        .map(id => getOrganisationalUnit(id) + '_' + getType(id));
      const uniqTimestamps = [...new Set(timestamps)];

      return uniqTimestamps.map(time => buildSession(time)).sort((a, b) => a.ouid > b.ouid);
    };

    setSessions(buildSessions(filteredCamps));
  }, [filteredCamps]);

  const deleteCampaignById = async id => {
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
                  <TableCell align="center">{t('OrganizationalUnit')}</TableCell>
                  <TableCell align="center">{t('TypeOfTraining')}</TableCell>
                  <TableCell align="center">{t('NumberOfCampaigns')}</TableCell>
                  <TableCell align="center">{t('Delete')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(session => {
                  return (
                    <TableRow key={session.timeStamp}>
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
              <Typography variant="h6">{`Suppression des ${sessionToDelete?.campaigns?.length} ${sessionToDelete?.type} ${sessionToDelete?.ouid}`}</Typography>
              <div className={classes.buttonContainer}>
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
