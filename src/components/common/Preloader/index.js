import { Backdrop, makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import imgPreloader from './../../../img/loader.svg';

const useStyles = makeStyles(() => ({
  backdrop: {
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
  img: { marginTop: '10%' },
}));

const Preloader = ({ message }) => {
  const classes = useStyles();
  return (
    <Backdrop className={classes.backdrop} open>
      <img className={classes.img} src={imgPreloader} alt="waiting..." />
      <h2>Chargement en cours</h2>
      <h3>{message}</h3>
    </Backdrop>
  );
};

export default Preloader;
Preloader.propTypes = {
  message: PropTypes.string.isRequired,
};
