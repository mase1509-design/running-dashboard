import React, { useState, useEffect } from 'react';
import EventForm from './components/EventForm';
import EventTable from './components/EventTable';
import logo from './assets/logo.png';

const STORAGE_KEY = 'running_dashboard_entries_v1';

function App() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setEntries(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const addEntry = (entry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const clearAll = () => {
    if (window.confirm('Alle Einträge löschen?')) {
      setEntries([]);
    }
  }; 

  return (
    <div className="container">
      <header className="header">
        <img src={logo} alt="Running Dashboard" className="logo" />
        <h1>Running Dashboard</h1>
      </header>

      <main>
        <EventForm onAdd={addEntry} />
        <div className="table-actions">
          <button onClick={clearAll} className="btn btn-danger">Alle Einträge löschen</button>
        </div>
        <EventTable entries={entries} />
      </main>

      <footer className="footer">
        <small>Local app · Daten werden lokal im Browser gespeichert</small>
      </footer>
    </div>
  );
}

export default App;
