import { BrowserRouter, Route, Switch } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import Header from '../header';
import Navigation from '../navigation';
import OrganisationUnitsVue from '../orgaUnitsVue';
import Preloader from '../common/Preloader';
import Requester from '../requester';
import TrainingCourses from '../trainingCourses';
import { Typography } from '@material-ui/core';
import { getConfiguration } from '../../utils/configuration';
import { getUser } from '../../utils/userInfo';
import { getUserOrganisationalUnit } from '../../utils/api/massive-attack-api';
import { useAuth } from '../../utils/hook/auth';

export const AppContext = React.createContext();

const App = () => {
  const { authenticated, isAdmin, pending } = useAuth();
  const [organisationalUnit, setOrganisationalUnit] = useState();
  const [pf, setPf] = useState('');

  useEffect(() => {
    const fetchUserOrgaUnit = async () => {
      const { MASSIVE_ATTACK_API_URL, AUTHENTICATION_MODE, PLATEFORM } = await getConfiguration();
      const orgaUnitResponse = await getUserOrganisationalUnit(
        MASSIVE_ATTACK_API_URL,
        AUTHENTICATION_MODE,
        PLATEFORM
      );
      setOrganisationalUnit(await orgaUnitResponse.data);
      setPf(PLATEFORM);
    };
    if (authenticated) fetchUserOrgaUnit();
  }, [authenticated]);

  const context = { organisationalUnit, isAdmin };

  return (
    <div>
      {pending && <Preloader message="Patientez" />}
      {!pending && !authenticated && (
        <Typography variant="h2" color="error">
          Vous n'avez pas les droits pour vous connecter à cette application.
        </Typography>
      )}
      {authenticated && (
        <>
          <Header user={getUser()} pf={pf} />
          <BrowserRouter>
            <AppContext.Provider value={context}>
              <div>
                <Route
                  path="/"
                  render={({ location }) => (
                    <>
                      <Navigation location={location} />
                      <Switch>
                        <Route exact path="/" component={Requester} />
                        <Route path="/training-courses" component={TrainingCourses} />
                        <Route path="/organisation-units-vue" component={OrganisationUnitsVue} />
                      </Switch>
                    </>
                  )}
                />
              </div>
            </AppContext.Provider>
          </BrowserRouter>
        </>
      )}
    </div>
  );
};

export default App;
