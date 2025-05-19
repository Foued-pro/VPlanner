import React from 'react';
import { Link } from 'react-router-dom';


const Header = () => {
  return (
    <header className="header">
        <div className="container">
      <h1 className="logo">VPlanner</h1>
      <nav>
        <ul className="nav-list">
          <li><Link to="/">Accueil</Link></li>
          <li><Link to="/explore">Explorer</Link></li>
          <li><Link to="/create">Créer un itinéraire</Link></li>
          <li><Link to="/login">Se connecter</Link></li>
        </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
