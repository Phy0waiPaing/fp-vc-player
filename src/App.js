import React from 'react';
import './App.css';
import LocalRoom from './LocalRoom'
import RoomURL from './RoomURL'
import ParticipantRoom from './ParticipantRoom';

function App() {
  return (
    <div className="App">
      <ParticipantRoom />
      <br />
      <LocalRoom />
      <RoomURL/>
    </div>
  );
}

export default App;
