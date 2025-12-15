import React, { useState } from 'react';
import ActorNetworkApp from './ActorNetworkApp';
import RegistrationPage from './RegistrationPage';

function App() {
  // Simple state-based routing for the prototype
  // 'app' -> Main Dashboard
  // 'register' -> Registration Form
  const [currentScreen, setCurrentScreen] = useState('register');

  const handleRegistrationComplete = () => {
    // In a real app, this would log the user in
    setCurrentScreen('app');
  };

  const handleLoginClick = () => {
    setCurrentScreen('app');
  };

  return (
    <>
      {currentScreen === 'app' && <ActorNetworkApp />}
      {currentScreen === 'register' && (
        <RegistrationPage
          onComplete={handleRegistrationComplete}
          onLoginClick={handleLoginClick}
        />
      )}
    </>
  );
}

export default App;
