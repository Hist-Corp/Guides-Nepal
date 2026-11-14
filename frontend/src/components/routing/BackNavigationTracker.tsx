import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { recordNavigation } from '../../utils/backNavigation';

/**
 * Records every router transition so in-app back buttons can send the user to
 * the page they came from. See utils/backNavigation for the trail policy.
 */
const BackNavigationTracker: React.FC = () => {
  const { pathname } = useLocation();
  const action = useNavigationType();

  useEffect(() => {
    recordNavigation(pathname, action);
  }, [pathname, action]);

  return null;
};

export default BackNavigationTracker;
