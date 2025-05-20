import React from 'react';
import { useState } from 'react';

const DevPanel = ({ logs }) => {
  return (
    <div className="devpanel-container">
      <h2>Logs de Debug (JSON)</h2>
      <pre className="devpanel-pre">
        {logs.map((log, i) => (
          <div key={i}>{JSON.stringify(log, null, 2)}</div>
        ))}
      </pre>
    </div>
  );
};

export default DevPanel;


