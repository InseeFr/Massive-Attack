import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Typography } from '@material-ui/core';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../utils/i18n/i18n';
import Header from '../header';
import Navigation from '../navigation';
import OrganisationUnitsVue from '../orgaUnitsVue';
import Preloader from '../common/Preloader';
import Requester from '../requester';
import TrainingCourses from '../trainingCourses';
import { getConfiguration } from '../../utils/configuration';
import { getUserOrganisationalUnit } from '../../utils/api/massive-attack-api';
import { getUser } from '../../utils/userInfo';
import { useAuth } from '../../utils/hook/auth';

export const AppContext = React.createContext();

const App = () => {
  const { authenticated, isAdmin, pending } = useAuth();
  const [organisationalUnit, setOrganisationalUnit] = useState();
  const [pf, setPf] = useState('');
  const [dateReference, setDateReference] = useState(new Date().getTime());
  const [campaignLabel, setCampaignLabel] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [interviewers, setInterviewers] = useState([{ id: '', index: 0 }]);
  const [sessionType, setSessionType] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [organisationalUnits, setOrganisationalUnits] = useState([]);
  const [availableSessions, setAvailableSessions] = useState(undefined);

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

  const context = {
    organisationalUnit,
    setOrganisationalUnit,
    isAdmin,
    dateReference,
    setDateReference,
    campaignLabel,
    setCampaignLabel,
    campaignId,
    setCampaignId,
    interviewers,
    setInterviewers,
    sessionType,
    setSessionType,
    error,
    setError,
    organisationalUnits,
    setOrganisationalUnits,
    availableSessions,
    setAvailableSessions,
  };

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
            <I18nextProvider i18n={i18n}>
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
            </I18nextProvider>
          </BrowserRouter>
        </>
      )}
    </div>
  );
};

export default App;
