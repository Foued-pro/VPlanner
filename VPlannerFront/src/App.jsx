import './App.css'
import React,{useEffect} from 'react'
import { useState } from 'react';
import Header from './components/Header'
import Footer from './components/Footer'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Explore from './components/Explore';
import DevPanel from './components/DevPanel';
import Plan from './components/Plan';

function App() {
  const [logs, setLogs] = useState([]);

  const addLog = (entry) => {
    setLogs(prev => [...prev, entry]);
  };


  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <main className="hero">
              <div className="hero-content">
                <h1>Bienvenue sur VPlanner</h1>
                <p className="subtitle">Planifiez facilement vos voyages et créez des itinéraires sur mesure</p>
                <button
                  className="cta-button"
                  onClick={() => window.location.href = '/explore'}
                >
                  Commencer l'aventure
                </button>
              </div>
            </main>
          }
        />
        <Route path="/explore" element={<Explore addLog={addLog} />} />
        <Route path="/dev" element={<DevPanel logs={logs} />} />
        <Route path="/plan" />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}


export default App
