import AppBar from '@material-ui/core/AppBar';
import PropTypes from 'prop-types';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core';
import packagejson from '../../../package.json';
import { LOC_STOR_PLATFORM_KEY } from 'utils/constants';

const appVersion = packagejson.version;
const useStyles = makeStyles(() => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1em',
    marginBottom: '1em',
  },
  textBlock: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  marginLeft: {
    marginLeft: '0.5em',
  },
}));

const Header = ({ user = { firstName: 'John', lastName: 'Doe' } }) => {
  const classes = useStyles();
  const { firstName, lastName } = user;
  const pf = window.localStorage.getItem(LOC_STOR_PLATFORM_KEY);
  return (
    <AppBar className={classes.row} position="static">
      <div className={classes.textBlock}>
        <Typography variant="h4">MASSIVE ATTACK</Typography>
        <Typography className={classes.marginLeft} variant="h6" color="error">
          {appVersion}
        </Typography>
      </div>
      <Typography variant="h4">{`==> ${pf}`}</Typography>

      <Typography variant="h6">{`${firstName} ${lastName}`}</Typography>
    </AppBar>
  );
};

export default Header;
Header.propTypes = {
  user: PropTypes.shape({
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
  }),
};
