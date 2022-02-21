import { useEffect, useState } from 'react';

export const useConfiguration = () => {
  const [configuration, setConfiguration] = useState(null);

  useEffect(() => {
    if (!configuration) {
      console.log('load conf');
      const loadConfiguration = async () => {
        const response = await fetch(`${window.location.origin}/configuration.json`);
        const configurationResponse = await response.json();
        setConfiguration(configurationResponse);
      };
      loadConfiguration();
    }
  }, [configuration]);

  return { configuration };
};
