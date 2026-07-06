import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ChildSessionProvider } from './contexts/ChildSessionContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ChildSessionProvider>
        <App />
      </ChildSessionProvider>
    </AuthProvider>
  </React.StrictMode>
);
