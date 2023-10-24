import { Paper, Tab, Tabs } from '@material-ui/core';
import React, { useContext } from 'react';
import { AppContext } from '../app/App';
import { Link } from 'react-router-dom';
import StarIcon from '@material-ui/icons/Star';
import HomeIcon from '@material-ui/icons/Home';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles({
  root: {
    marginBottom: '1em',
  },
});

const Navigation = ({ location }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { isAdmin } = useContext(AppContext);

  const adminIcon = <StarIcon color="error" />;
  const homeIcon = <HomeIcon color="error" />;
  const formation = <AssignmentIcon color="error" />;
  return (
    <Paper className={classes.root}>
      <Tabs value={location.pathname}>
        <Tab label={t('HomePage')} value="/" component={Link} to="/" icon={homeIcon}></Tab>
        <Tab
          label={t('TrainingSession')}
          value="/training-courses"
          component={Link}
          to="/training-courses"
          icon={formation}
        ></Tab>
        <Tab
          label="Administration"
          value="/organisation-units-vue"
          component={Link}
          to="/organisation-units-vue"
          icon={adminIcon}
          disabled={!isAdmin}
        ></Tab>
      </Tabs>
    </Paper>
  );
};

export default Navigation;
