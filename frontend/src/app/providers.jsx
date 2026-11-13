import AuthProvider from '../auth/AuthProvider';

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
