import { useEffect, useRef } from 'react';

const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    let id;
    const tick = () => {
      savedCallback.current();
    };
    if (delay !== null) {
      id = setInterval(tick, delay);
    }
    return () => {
      clearInterval(id);
    };
  }, [delay]);
  return savedCallback;
};
export default useInterval;
