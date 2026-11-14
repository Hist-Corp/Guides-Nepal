import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const action = useNavigationType();

  useEffect(() => {
    if (action !== 'POP') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [action, pathname]);

  return null;
};

export default ScrollToTop;
