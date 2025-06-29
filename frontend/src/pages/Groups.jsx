import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/groups.scss';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allGroups, setAllGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [managedGroups, setManagedGroups] = useState([]);
  const [createData, setCreateData] = useState({ name: '', description: '', privacy: 'public', image: null });
  const [createStatus, setCreateStatus] = useState('');
  const [managePanelOpen, setManagePanelOpen] = useState(false);
  const [manageGroup, setManageGroup] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Fetch all groups, my groups, and managed groups on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/groups/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setAllGroups(Array.isArray(res.data) ? res.data : []);
        setMyGroups((Array.isArray(res.data) ? res.data : []).filter(g => !!g.joined));
      })
      .catch(() => {
        setAllGroups([]);
        setMyGroups([]);
      });
    axios.get('/api/groups/managed', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setManagedGroups(Array.isArray(res.data) ? res.data : []))
      .catch(() => setManagedGroups([]));
  }, []);

  // Search groups (filters allGroups client-side)
  const handleSearch = (e) => {
    e.preventDefault();
    // No API call, just filter
    // Optionally, you can call the backend search endpoint if you want server-side search
  };

  // Create group
  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', createData.name);
    formData.append('description', createData.description);
    formData.append('privacy', createData.privacy);
    if (createData.image) formData.append('image', createData.image);
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/groups/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setCreateStatus('Group created!');
      setCreateData({ name: '', description: '', privacy: 'public', image: null });
      // Refresh groups
      const res = await axios.get('/api/groups/all', { headers: { Authorization: `Bearer ${token}` } });
      setAllGroups(Array.isArray(res.data) ? res.data : []);
      setMyGroups((Array.isArray(res.data) ? res.data : []).filter(g => !!g.joined));
      // Refresh managed groups
      const managedRes = await axios.get('/api/groups/managed', { headers: { Authorization: `Bearer ${token}` } });
      setManagedGroups(Array.isArray(managedRes.data) ? managedRes.data : []);
    } catch {
      setCreateStatus('Failed to create group');
    }
  };

  // Join/request group
  const handleJoin = (groupId, privacy) => {
    const token = localStorage.getItem('token');
    axios.post('/api/groups/join', { groupId }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        // Refresh groups
        axios.get('/api/groups/all', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            setAllGroups(Array.isArray(res.data) ? res.data : []);
            setMyGroups((Array.isArray(res.data) ? res.data : []).filter(g => !!g.joined));
          });
      });
  };

  // Leave group
  const handleLeave = (groupId) => {
    const token = localStorage.getItem('token');
    axios.post('/api/groups/leave', { groupId }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        // Refresh groups
        axios.get('/api/groups/all', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            setAllGroups(Array.isArray(res.data) ? res.data : []);
            setMyGroups((Array.isArray(res.data) ? res.data : []).filter(g => !!g.joined));
          });
      });
  };

  // Open manage panel for a group
  const openManagePanel = async (group) => {
    setManageGroup(group);
    setManagePanelOpen(true);
    // Fetch pending requests
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/groups/${group.id}/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPendingRequests([]);
    }
  };

  // Accept/reject join request
  const handleRequestAction = async (userId, action) => {
    const token = localStorage.getItem('token');
    await axios.post('/api/groups/handle-request', {
      groupId: manageGroup.id,
      userId,
      action
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Remove user from pendingRequests immediately
    setPendingRequests(prev => prev.filter(user => user.id !== userId));
    toast.success(action === 'accept' ? 'User accepted!' : 'User rejected!');
    // Optionally, refresh from backend as well
    // const res = await axios.get(`/api/groups/${manageGroup.id}/pending`, {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // setPendingRequests(Array.isArray(res.data) ? res.data : []);
  };

  // Filtered groups for search
  const filteredGroups = searchTerm
    ? allGroups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : allGroups;

  // Count total pending requests for notification bell
  const totalPending = managedGroups.length > 0 ? managedGroups.reduce((sum, group) => sum + (group.pendingCount || 0), 0) : 0;
  // Optionally, export totalPending for Navbar

  return (
    <div className="groups-page">
      <h1>Groups</h1>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link to="/create-group">
          <button className="manage-btn" style={{ fontSize: '1.1rem', padding: '0.7rem 2.2rem', borderRadius: '12px' }}>+ Create New Group</button>
        </Link>
      </div>
      <div className="groups-flex-container">
        {/* Managed Groups Section */}
        <div className="my-groups-section">
          <h2>Groups I Manage</h2>
          <div className="joined-groups-scroll">
            {managedGroups.length === 0 && <div style={{ color: '#888', padding: '1rem' }}>You haven't created any groups yet.</div>}
            {managedGroups.map(group => (
              <div key={group.id} className="group-card">
                <img src={group.image ? `http://localhost:5001/uploads/groups/${group.image}` : '/uploads/groups/default-group.png'} alt={group.name} />
                <div className="group-title">{group.name}</div>
                <button className="manage-btn" onClick={() => openManagePanel(group)}>Manage</button>
              </div>
            ))}
          </div>
          {/* My Groups Section */}
          <h2>My Groups</h2>
          <div className="joined-groups-scroll">
            {myGroups.length === 0 && <div style={{ color: '#888', padding: '1rem' }}>You haven't joined any groups yet.</div>}
            {myGroups.map(group => (
              <div key={group.id} className="group-card">
                <img src={group.image ? `http://localhost:5001/uploads/groups/${group.image}` : '/uploads/groups/default-group.png'} alt={group.name} />
                <div className="group-title">{group.name}</div>
                <button className="leave-btn" onClick={() => handleLeave(group.id)}>Leave</button>
              </div>
            ))}
          </div>
        </div>
        {/* Browse/Search Groups Section */}
        <div className="browse-groups-section">
          <div className="search-section">
            <form onSubmit={handleSearch}>
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search groups by name" />
              <button type="submit">Search</button>
            </form>
            <div className="search-results">
              {filteredGroups.map(group => (
                <div key={group.id} className="result-row">
                  <img src={group.image ? `http://localhost:5001/uploads/groups/${group.image}` : '/uploads/groups/default-group.png'} alt={group.name} />
                  <span className="group-name">{group.name}</span>
                  <span className="privacy">({group.privacy})</span>
                  {group.joined ? (
                    <button className="joined-btn" disabled>Joined</button>
                  ) : (
                    <button className="join-btn" onClick={() => handleJoin(group.id, group.privacy)}>
                      {group.privacy === 'private' ? 'Request to Join' : 'Join'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Manage Panel Modal */}
      {managePanelOpen && manageGroup && (
        <div className="manage-panel-modal" onClick={() => setManagePanelOpen(false)}>
          <div className="manage-panel" onClick={e => e.stopPropagation()}>
            <div className="manage-panel-header">
              <button className="close-btn" onClick={() => setManagePanelOpen(false)}>×</button>
              <h2>Manage Group: {manageGroup.name}</h2>
              <img src={manageGroup.image ? `http://localhost:5001/uploads/groups/${manageGroup.image}` : '/uploads/groups/default-group.png'} alt={manageGroup.name} />
            </div>
            <div className="privacy-row"><strong>Privacy:</strong> {manageGroup.privacy}</div>
            <div style={{ margin: '1rem 0', width: '100%' }}>
              <strong>Pending Join Requests:</strong>
              {pendingRequests.length === 0 ? (
                <div style={{ color: '#888', marginTop: 8 }}>No pending requests.</div>
              ) : (
                <div className="pending-requests-list">
                  {pendingRequests.map(user => (
                    <div key={user.id} className="pending-request-row">
                      <img src={user.image ? `http://localhost:5001/uploads/${user.image}` : '/uploads/users/default-avatar.png'} alt={user.username} />
                      <span className="username">{user.username}</span>
                      <div className="action-btns">
                        <button className="accept-btn" onClick={() => handleRequestAction(user.id, 'accept')}>Accept</button>
                        <button className="reject-btn" onClick={() => handleRequestAction(user.id, 'reject')}>Reject</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups; 