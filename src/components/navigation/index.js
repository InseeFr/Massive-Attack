import { Paper, Tab, Tabs } from '@material-ui/core';

import { Link } from 'react-router-dom';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    marginBottom: '1em',
  },
});

const Navigation = ({ location }) => {
  const classes = useStyles();

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
      </Tabs>
    </Paper>
  );
};

export default Navigation;
