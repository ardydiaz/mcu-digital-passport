import AuthProvider from '../auth/AuthProvider';
import ToastProvider from '../components/common/ToastProvider';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
