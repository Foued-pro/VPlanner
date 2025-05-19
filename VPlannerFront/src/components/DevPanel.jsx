import React from 'react';
import { useState } from 'react';

const DevPanel = ({logs}) => {
    return (
        <div style={{ padding: '2rem' }}>
      <h2>Logs de Debug</h2>
      <pre style={{ background: '#f0f0f0', padding: '1rem', maxHeight: '500px', overflowY: 'scroll' }}>
        {logs.map((log, i) => (
          <div key={i}>{JSON.stringify(log, null, 2)}</div>
        ))}
      </pre>
    </div>
  );
};

export default DevPanel;
