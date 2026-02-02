import React from 'react';
import { Link } from 'react-router-dom';

function Index() {
  return (
    <div>
      <h1>Home</h1>
      <Link to="/register">Registrar</Link>
    </div>
  );
}

export default Index;