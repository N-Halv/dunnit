import './LoginScreen.css';

import { useAuth0 } from '@auth0/auth0-react';

export function LoginScreen() {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="login-screen">
      <h1 className="login-screen__title">Welcome to Dunnit</h1>
      <p className="login-screen__subtitle">
        Sign in to access your todo lists.
      </p>
      <button
        type="button"
        className="login-screen__button"
        onClick={() => loginWithRedirect()}
      >
        Log in
      </button>
    </div>
  );
}
