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
import React, { useContext } from 'react';
import { deleteCampaign, getCampaigns } from '../../utils/api/massive-attack-api';

import { AppContext } from '../app/App';
import DeleteIcon from '@material-ui/icons/Delete';
import Preloader from '../common/Preloader';
import { getConfiguration } from '../../utils/configuration/index';

const useStyles = makeStyles(() => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    margin: '1em',
  },
}));

const TrainingCourses = () => {
  const { organisationalUnit } = useContext(AppContext);
  const [campaigns, setCampaigns] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [openModal, setOpenModal] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState();
  const [filteredCamps, setFilteredCamps] = React.useState([]);
  const [waiting, setWaiting] = React.useState(false);

  const classes = useStyles();

  React.useEffect(() => {
    const isVisibleCampaign = camp => {
      const { id } = camp;
      const [, , orgaUnit] = id.split('_');

      return orgaUnit === organisationalUnit?.id;
    };

    setFilteredCamps(campaigns.filter(camp => isVisibleCampaign(camp)));
  }, [campaigns, organisationalUnit?.id]);

  React.useEffect(() => {
    const fetchCampaigns = async () => {
      const { MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM } = await getConfiguration();
      const camps = await getCampaigns(MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM);
      setCampaigns(await camps.data);
    };
    fetchCampaigns();
  }, []);

  React.useEffect(() => {
    const getTimestamp = id => id.split('_')[3];
    const getType = id => id.split('_')[1];

    const buildSessions = camps => {
      const buildSession = timeStampType => {
        const [timeStamp, type] = timeStampType.split('_');
        const timedCampaigns = camps
          .map(camp => {
            const { id } = camp;
            return { ...camp, time: getTimestamp(id), type: getType(id) };
          })
          .filter(camp => camp.time === timeStamp && camp.type === type);
        const sessionType = timedCampaigns[0].type;

        return { timeStamp, campaigns: timedCampaigns, type: sessionType };
      };

      const timestamps = camps.map(camp => camp.id).map(id => getTimestamp(id) + '_' + getType(id));
      const uniqTimestamps = [...new Set(timestamps)];

      return uniqTimestamps.map(time => buildSession(time));
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
                  <TableCell align="center">Identifiant</TableCell>
                  <TableCell align="center">Type de formation</TableCell>
                  <TableCell align="center">Nombre de campagnes</TableCell>
                  <TableCell align="center">Supprimer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(session => (
                  <TableRow key={session.timeStamp}>
                    <TableCell align="center">{session.timeStamp}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Dialog onClose={handleClose} open={openModal}>
            <Typography variant="h6">{`Suppression de la session ${sessionToDelete?.type} ${sessionToDelete?.timeStamp}`}</Typography>
            <div className={classes.row}>
              <Button onClick={handleClose}>Annuler</Button>
              <Button onClick={confirmDeletion}>Valider</Button>
            </div>
          </Dialog>
        </>
      )}
    </>
  );
};

export default TrainingCourses;
