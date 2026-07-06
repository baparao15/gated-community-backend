import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../store/authSlice';

export default function useAuth() {
  const auth = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  return {
    ...auth,
    login: (payload) => dispatch(login(payload)),
    logout: () => dispatch(logout()),
  };
}
