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
import { getConfiguration } from '../../utils/configuration/index';

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

const OrganisationUnitsVue = () => {
  const classes = useStyles();

  const { isAdmin = false } = useContext(AppContext);
  const [campaigns, setCampaigns] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState();
  const [filteredCamps, setFilteredCamps] = useState([]);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setFilteredCamps(campaigns.filter(({ id }) => id.includes('_')));
  }, [campaigns, isAdmin]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM } = await getConfiguration();
      const camps = await getCampaigns(
        MASSIVE_ATTACK_API_URL,
        AUTHENTICATION_MODE,
        PLATEFORM,
        isAdmin
      );
      setCampaigns(await camps.data);
    };
    fetchCampaigns();
  }, [isAdmin]);

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
    const { MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM } = await getConfiguration();
    return deleteCampaign(MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM)(id);
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
          <Typography variant="h6">Liste des sessions de formation</Typography>
          <TableContainer component={Paper}>
            <Table aria-label="training courses table">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Unité organisationnelle</TableCell>
                  <TableCell align="center">Type de formation</TableCell>
                  <TableCell align="center">Nombre de campagnes</TableCell>
                  <TableCell align="center">Supprimer</TableCell>
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
                  Annuler
                </Button>
                <Button variant="contained" color="primary" onClick={confirmDeletion}>
                  Valider
                </Button>
              </div>
            </div>
          </Dialog>
        </>
      )}
    </>
  );
};

export default OrganisationUnitsVue;
