import { Paper, Tab, Tabs } from '@material-ui/core';
import React, { useContext } from 'react';

import { AppContext } from '../app/App';
import { Link } from 'react-router-dom';
import StarIcon from '@material-ui/icons/Star';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    marginBottom: '1em',
  },
});

const Navigation = ({ location }) => {
  const classes = useStyles();
  const { isAdmin } = useContext(AppContext);

  const adminIcon = <StarIcon color="error"></StarIcon>;
  return (
    <Paper className={classes.root}>
      <Tabs value={location.pathname}>
        <Tab label="Accueil" value="/" component={Link} to="/"></Tab>
        <Tab
          label="Sessions de formation"
          value="/training-courses"
          component={Link}
          to="/training-courses"
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
