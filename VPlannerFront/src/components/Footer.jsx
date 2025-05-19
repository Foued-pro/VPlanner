import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className='footer'>
      <p>&copy; {new Date().getFullYear()} VPplanner. Tous droits réservés.</p>
      <Link to="/about">A propos</Link>
      <Link to="/contact">Contact</Link>
    </footer>
  );
};


export default Footer;
