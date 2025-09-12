import React, { useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const ApiManagement = () => {
  const [specUrl, setSpecUrl] = useState('http://localhost:8080/v3/api-docs');
  const services = [
    { name: 'Accounts Service', url: 'http://localhost:8080/v3/api-docs' },
    { name: 'Books Service', url: 'http://localhost:8081/v3/api-docs' },
    { name: 'Orders Service', url: 'http://localhost:8082/v3/api-docs'}
  ];

  return (
    <div>
      <select onChange={(e) => setSpecUrl(e.target.value)} value={specUrl}>
        {services.map(s => <option key={s.url} value={s.url}>{s.name}</option>)}
      </select>
      <SwaggerUI url={specUrl} />
    </div>
  );
};

export default ApiManagement;