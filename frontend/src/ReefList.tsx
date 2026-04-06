import { useState, useEffect } from 'react';
import { api } from './api';
import type { Reef, ReefCreate, Observation, Trend, ObservationCreate } from './types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function ReefList() {
  const [reefs, setReefs] = useState<Reef[]>([]);
  const [selectedReefId, setSelectedReefId] = useState<number | null>(null);
  const [showAddReef, setShowAddReef] = useState(false);
  const [newReef, setNewReef] = useState<ReefCreate>({ name: '', location: '' });
  
  const [observations, setObservations] = useState<Observation[]>([]);
  const [trends, setTrends] = useState<Trend | null>(null);
  const [newObs, setNewObs] = useState<ObservationCreate>({
    reef_id: 0,
    temperature: 0,
    bleaching_level: 0,
    biodiversity_score: 0,
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReefs();
  }, []);

  useEffect(() => {
    if (selectedReefId) {
      fetchReefDetails(selectedReefId);
      setNewObs(prev => ({ ...prev, reef_id: selectedReefId }));
    }
  }, [selectedReefId]);

  const fetchReefs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReefs();
      setReefs(data);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReefDetails = async (id: number) => {
    try {
      const [obsData, trendData] = await Promise.all([
        api.getObservations({ reef_id: id }),
        api.getReefTrends(id).catch(() => null)
      ]);
      setObservations(obsData);
      setTrends(trendData);
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const handleCreateReef = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createReef(newReef);
      setNewReef({ name: '', location: '' });
      setShowAddReef(false);
      fetchReefs();
    } catch (error: any) {
      alert(`Failed to create reef: ${error.message}. Ensure the backend is running at http://localhost:8080`);
    }
  };

  const handleDeleteReef = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Delete this reef?')) return;
    try {
      await api.deleteReef(id);
      if (selectedReefId === id) setSelectedReefId(null);
      fetchReefs();
    } catch (error: any) {
      alert(`Failed to delete reef: ${error.message}`);
    }
  };

  const handleLogObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReefId) return;
    try {
      await api.createObservation({ ...newObs, reef_id: selectedReefId });
      setNewObs({
        reef_id: selectedReefId,
        temperature: 0,
        bleaching_level: 0,
        biodiversity_score: 0,
        notes: ''
      });
      fetchReefDetails(selectedReefId);
    } catch (error: any) {
      alert(`Failed to log observation: ${error.message}`);
    }
  };

  const selectedReef = reefs.find(r => r.id === selectedReefId);

  return (
    <div className="container">
      <header>
        <h1>Coral Reef Health Tracker</h1>
        <p>Monitor and protect our marine ecosystems</p>
      </header>

      <div className="card">
        <div className="add-reef-toggle">
          <h2>Your Reefs</h2>
          <button className="btn btn-primary" onClick={() => setShowAddReef(!showAddReef)}>
            {showAddReef ? 'Cancel' : 'Add Reef'}
          </button>
        </div>

        {showAddReef && (
          <form onSubmit={handleCreateReef} className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Name</label>
                <input required value={newReef.name} onChange={e => setNewReef({...newReef, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input required value={newReef.location} onChange={e => setNewReef({...newReef, location: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-secondary" style={{ marginTop: '1rem' }}>Create Reef</button>
          </form>
        )}

        <div className="grid">
          {reefs.map(reef => (
            <div 
              key={reef.id} 
              className={`card reef-card ${selectedReefId === reef.id ? 'active' : ''}`}
              onClick={() => setSelectedReefId(reef.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3>{reef.name}</h3>
                  <p>{reef.location}</p>
                </div>
                <button className="btn btn-danger btn-icon" onClick={(e) => handleDeleteReef(e, reef.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedReef && (
        <div className="reef-detail-grid" style={{ marginTop: '3rem' }}>
          <div className="card">
            <h2>{selectedReef.name} - Health Trends</h2>
            {trends ? (
              <>
                <div className="trends">
                  <div className="trend-item"><span>Avg Bleaching:</span> <strong>{trends.average_bleaching_level.toFixed(1)}%</strong></div>
                  <div className="trend-item"><span>Avg Biodiversity:</span> <strong>{trends.average_biodiversity_score.toFixed(1)}/100</strong></div>
                </div>
                {observations.length > 1 && (
                  <div style={{ height: 300, marginTop: '2rem' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[...observations].sort((a,b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#0077be" name="Temp" />
                        <Line yAxisId="right" type="monotone" dataKey="bleaching_level" stroke="#e74c3c" name="Bleaching" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            ) : <p>No data yet.</p>}
          </div>

          <div className="card">
            <h3>Log New Observation</h3>
            <form onSubmit={handleLogObservation}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group"><label>Temp</label><input type="number" step="0.1" value={newObs.temperature} onChange={e => setNewObs({...newObs, temperature: parseFloat(e.target.value)})} /></div>
                <div className="form-group"><label>Bleaching</label><input type="number" value={newObs.bleaching_level} onChange={e => setNewObs({...newObs, bleaching_level: parseInt(e.target.value)})} /></div>
                <div className="form-group"><label>Biodiversity</label><input type="number" value={newObs.biodiversity_score} onChange={e => setNewObs({...newObs, biodiversity_score: parseInt(e.target.value)})} /></div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Notes</label>
                <textarea value={newObs.notes} onChange={e => setNewObs({...newObs, notes: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Log Observation</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReefList;
