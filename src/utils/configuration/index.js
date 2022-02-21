export const getConfiguration = async () => {
  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  const response = await fetch(`${publicUrl.origin}/configuration.json`);
  const configuration = await response.json();
  return configuration;
};
