import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from './api';
import type { Reef, Observation, Trend, ObservationCreate, ObservationUpdate } from './types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReefDetailProps {
  activeTab: 'trends' | 'log';
}

function ReefDetail({ activeTab }: ReefDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reefId = parseInt(id || '0');

  const [reef, setReef] = useState<Reef | null>(null);
  const [allReefs, setAllReefs] = useState<Reef[]>([]);
  const [trends, setTrends] = useState<Trend | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [newObs, setNewObs] = useState<ObservationCreate>({
    reef_id: reefId,
    temperature: 0,
    bleaching_level: 0,
    biodiversity_score: 0,
    notes: ''
  });

  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [editingObsId, setEditingObsId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<ObservationUpdate>({});

  useEffect(() => {
    if (reefId) {
      fetchData();
    }
  }, [reefId]);

  const fetchData = async () => {
    try {
      const reefs = await api.getReefs();
      setAllReefs(reefs);
      const currentReef = reefs.find(r => r.id === reefId);
      if (currentReef) {
        setReef(currentReef);
        const [obsData, trendData] = await Promise.all([
          api.getObservations({ reef_id: reefId }),
          api.getReefTrends(reefId).catch(() => null)
        ]);
        setObservations(obsData);
        setTrends(trendData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createObservation({ ...newObs, reef_id: reefId });
      setNewObs({
        reef_id: reefId,
        temperature: 0,
        bleaching_level: 0,
        biodiversity_score: 0,
        notes: ''
      });
      fetchData();
      alert('Observation logged successfully!');
      navigate(`/reef/${reefId}/trends`);
    } catch (error) {
      alert('Failed to create observation');
    }
  };

  const handleDeleteObservation = async (obsId: number) => {
    if (!confirm('Delete this observation?')) return;
    try {
      await api.deleteObservation(obsId);
      fetchData();
    } catch (error) {
      alert('Failed to delete observation');
    }
    setActiveMenu(null);
  };

  const startEditing = (obs: Observation) => {
    setEditingObsId(obs.id);
    setEditFormData({
      temperature: obs.temperature,
      bleaching_level: obs.bleaching_level,
      biodiversity_score: obs.biodiversity_score,
      notes: obs.notes
    });
    setActiveMenu(null);
  };

  const handleUpdateObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingObsId === null) return;
    try {
      await api.updateObservation(editingObsId, editFormData);
      setEditingObsId(null);
      fetchData();
    } catch (error) {
      alert('Failed to update observation');
    }
  };

  const currentIndex = allReefs.findIndex(r => r.id === reefId);
  const prevReef = currentIndex > 0 ? allReefs[currentIndex - 1] : null;
  const nextReef = currentIndex < allReefs.length - 1 ? allReefs[currentIndex + 1] : null;

  if (!reef) return <div className="container"><p>Loading reef details...</p></div>;

  return (
    <div className="container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            ← All Reefs
          </button>
          <div className="prev-next-nav">
            <button 
              className="btn btn-secondary btn-icon" 
              disabled={!prevReef}
              onClick={() => navigate(`/reef/${prevReef?.id}/${activeTab}`)}
              title="Previous Reef"
            >
              ⟨
            </button>
            <button 
              className="btn btn-secondary btn-icon" 
              disabled={!nextReef}
              onClick={() => navigate(`/reef/${nextReef?.id}/${activeTab}`)}
              title="Next Reef"
            >
              ⟩
            </button>
          </div>
        </div>
        <h1>{reef.name}</h1>
        <p>{reef.location}</p>
      </header>

      <div className="nav-tabs">
        <Link 
          to={`/reef/${reefId}/trends`} 
          className={`nav-tab ${activeTab === 'trends' ? 'active' : ''}`}
        >
          📈 Trends & History
        </Link>
        <Link 
          to={`/reef/${reefId}/log`} 
          className={`nav-tab ${activeTab === 'log' ? 'active' : ''}`}
        >
          📝 Log Observation
        </Link>
      </div>

      <div className="reef-detail-grid">
        {activeTab === 'trends' ? (
          <div className="reef-data">
            <div className="card">
              <h2>Health Summary</h2>
              {trends ? (
                <>
                  <div className="trends">
                    <div className="trend-item">
                      <span>Average Bleaching:</span>
                      <strong>{trends.average_bleaching_level.toFixed(1)}%</strong>
                    </div>
                    <div className="trend-item">
                      <span>Average Biodiversity:</span>
                      <strong>{trends.average_biodiversity_score.toFixed(1)}/100</strong>
                    </div>
                    <div className="trend-item">
                      <span>Total Observations:</span>
                      <strong>{trends.observation_count}</strong>
                    </div>
                  </div>
                  {observations.length > 1 && (
                    <div style={{ height: 350, marginTop: '2.5rem' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[...observations].sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime())}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(str) => new Date(str).toLocaleDateString()} 
                            stroke="#64748b"
                          />
                          <YAxis yAxisId="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" name="Temp (°C)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                          <Line yAxisId="right" type="monotone" dataKey="bleaching_level" stroke="#82ca9d" name="Bleaching (%)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>No data yet for this reef.</p>
                  <button className="btn btn-primary" onClick={() => navigate(`/reef/${reefId}/log`)}>Log Your First Observation</button>
                </div>
              )}
            </div>

            <div className="card">
              <h3>Observation History</h3>
              <div className="observation-list">
                {observations.length > 0 ? (
                  observations.sort((a,b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).map((obs) => (
                    <div key={obs.id} className="observation-item">
                      {editingObsId === obs.id ? (
                        <form onSubmit={handleUpdateObservation} className="edit-form">
                          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                              <label>Temperature (°C)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={editFormData.temperature}
                                onChange={(e) => setEditFormData({...editFormData, temperature: parseFloat(e.target.value)})}
                              />
                            </div>
                            <div className="form-group">
                              <label>Bleaching (%)</label>
                              <input
                                type="number"
                                value={editFormData.bleaching_level}
                                onChange={(e) => setEditFormData({...editFormData, bleaching_level: parseInt(e.target.value)})}
                              />
                            </div>
                            <div className="form-group">
                              <label>Biodiversity</label>
                              <input
                                type="number"
                                value={editFormData.biodiversity_score}
                                onChange={(e) => setEditFormData({...editFormData, biodiversity_score: parseInt(e.target.value)})}
                              />
                            </div>
                            <div className="form-group">
                              <label>Notes</label>
                              <input
                                value={editFormData.notes || ''}
                                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                              />
                            </div>
                          </div>
                          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary">Save Changes</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setEditingObsId(null)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="observation-header">
                            <div>
                              <strong>{obs.date ? new Date(obs.date).toLocaleDateString() : 'N/A'}</strong>
                              <p>{obs.temperature}°C | Bleaching: {obs.bleaching_level}% | Biodiversity: {obs.biodiversity_score}</p>
                            </div>
                            <div className="menu-container">
                              <button className="btn-menu" onClick={() => setActiveMenu(activeMenu === obs.id ? null : obs.id)}>⋮</button>
                              {activeMenu === obs.id && (
                                <div className="dropdown-menu">
                                  <button className="dropdown-item" onClick={() => startEditing(obs)}>Edit</button>
                                  <button className="dropdown-item delete" onClick={() => handleDeleteObservation(obs.id)}>Delete</button>
                                </div>
                              )}
                            </div>
                          </div>
                          {obs.notes && <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.5rem', background: '#fff', padding: '0.5rem', borderRadius: '8px' }}>{obs.notes}</p>}
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '1rem' }}>No observations recorded.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="reef-actions">
            <div className="card">
              <h2>New Observation</h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Log the current environmental conditions for {reef.name}.</p>
              <form onSubmit={handleCreateObservation}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label>Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newObs.temperature}
                      onChange={(e) => setNewObs({ ...newObs, temperature: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Bleaching Level (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={newObs.bleaching_level}
                      onChange={(e) => setNewObs({ ...newObs, bleaching_level: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Biodiversity Score (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={newObs.biodiversity_score}
                      onChange={(e) => setNewObs({ ...newObs, biodiversity_score: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Observation Date</label>
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Field Notes</label>
                  <textarea
                    rows={4}
                    value={newObs.notes}
                    onChange={(e) => setNewObs({ ...newObs, notes: e.target.value })}
                    placeholder="Describe coral condition, visible species, or any anomalies..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Log Observation</button>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate(`/reef/${reefId}/trends`)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReefDetail;
