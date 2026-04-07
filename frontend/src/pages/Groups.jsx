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
  const [joiningGroupIds, setJoiningGroupIds] = useState([]);
  const [postPermissionMode, setPostPermissionMode] = useState('all_members');
  const [postPermissionMembers, setPostPermissionMembers] = useState([]);
  const [allowedPostUserIds, setAllowedPostUserIds] = useState([]);
  const [savingPostPermissions, setSavingPostPermissions] = useState(false);

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
      setCreateStatus('Grupa zostala utworzona!');
      setCreateData({ name: '', description: '', privacy: 'public', image: null });
      // Refresh groups
      const res = await axios.get('/api/groups/all', { headers: { Authorization: `Bearer ${token}` } });
      setAllGroups(Array.isArray(res.data) ? res.data : []);
      setMyGroups((Array.isArray(res.data) ? res.data : []).filter(g => !!g.joined));
      // Refresh managed groups
      const managedRes = await axios.get('/api/groups/managed', { headers: { Authorization: `Bearer ${token}` } });
      setManagedGroups(Array.isArray(managedRes.data) ? managedRes.data : []);
    } catch {
      setCreateStatus('Nie udalo sie utworzyc grupy');
    }
  };

  // Join/request group
  const handleJoin = (groupId) => {
    if (joiningGroupIds.includes(groupId)) return;
    setJoiningGroupIds(prev => [...prev, groupId]);

    const token = localStorage.getItem('token');
    axios.post('/api/groups/join', { groupId }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (res.data?.status === 'pending') {
          toast.success('Wyslano prosbe o dolaczenie');
          setAllGroups(prev =>
            prev.map(group =>
              group.id === groupId
                ? { ...group, membershipStatus: 'pending', pending: 1 }
                : group
            )
          );
        } else {
          toast.success('Dolaczyles do grupy');
          setAllGroups(prev =>
            prev.map(group =>
              group.id === groupId
                ? { ...group, joined: 1, membershipStatus: 'joined' }
                : group
            )
          );
        }

        // Refresh groups
        axios.get('/api/groups/all', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => {
            setAllGroups(Array.isArray(res.data) ? res.data : []);
            setMyGroups((Array.isArray(res.data) ? res.data : []).filter(g => !!g.joined));
          });
      })
      .catch(() => {
        toast.error('Nie udalo sie wyslac prosby o dolaczenie');
      })
      .finally(() => {
        setJoiningGroupIds(prev => prev.filter(id => id !== groupId));
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

    try {
      const permissionsRes = await axios.get(`/api/groups/${group.id}/post-permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPostPermissionMode(permissionsRes.data?.mode || 'all_members');
      setPostPermissionMembers(Array.isArray(permissionsRes.data?.members) ? permissionsRes.data.members : []);
      setAllowedPostUserIds(Array.isArray(permissionsRes.data?.allowedUserIds) ? permissionsRes.data.allowedUserIds : []);
    } catch {
      setPostPermissionMode('all_members');
      setPostPermissionMembers([]);
      setAllowedPostUserIds([]);
    }
  };

  const handleToggleAllowedUser = (userId) => {
    setAllowedPostUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const savePostPermissions = async () => {
    if (!manageGroup) return;
    const token = localStorage.getItem('token');
    setSavingPostPermissions(true);
    try {
      await axios.put(`/api/groups/${manageGroup.id}/post-permissions`, {
        mode: postPermissionMode,
        allowedUserIds: postPermissionMode === 'selected_members' ? allowedPostUserIds : []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Ustawienia publikowania zapisane.');
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Nie udalo sie zapisac ustawien publikowania.');
    } finally {
      setSavingPostPermissions(false);
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
    toast.success(action === 'accept' ? 'Uzytkownik zaakceptowany!' : 'Uzytkownik odrzucony!');
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
      <h1>Grupy</h1>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Link to="/create-group">
          <button className="manage-btn" style={{ fontSize: '1.1rem', padding: '0.7rem 2.2rem', borderRadius: '12px' }}>+ Utworz nowa grupe</button>
        </Link>
      </div>
      <div className="groups-flex-container">
        {/* Managed Groups Section */}
        <div className="my-groups-section">
          <h2>Grupy, ktorymi zarzadzam</h2>
          <div className="joined-groups-scroll">
            {managedGroups.length === 0 && <div style={{ color: '#888', padding: '1rem' }}>Nie utworzyles jeszcze zadnej grupy.</div>}
            {managedGroups.map(group => (
              <div key={group.id} className="group-card">
                <img src={group.image ? `http://localhost:5001/uploads/groups/${group.image}` : '/uploads/groups/default-group.png'} alt={group.name} />
                <div className="group-title">{group.name}</div>
                <button className="manage-btn" onClick={() => openManagePanel(group)}>Zarzadzaj</button>
              </div>
            ))}
          </div>
          {/* My Groups Section */}
          <h2>Moje grupy</h2>
          <div className="joined-groups-scroll">
            {myGroups.length === 0 && <div style={{ color: '#888', padding: '1rem' }}>Nie dolaczyles jeszcze do zadnej grupy.</div>}
            {myGroups.map(group => (
              <div key={group.id} className="group-card">
                <img src={group.image ? `http://localhost:5001/uploads/groups/${group.image}` : '/uploads/groups/default-group.png'} alt={group.name} />
                <div className="group-title">{group.name}</div>
                <button className="leave-btn" onClick={() => handleLeave(group.id)}>Opusc</button>
              </div>
            ))}
          </div>
        </div>
        {/* Browse/Search Groups Section */}
        <div className="browse-groups-section">
          <div className="search-section">
            <form onSubmit={handleSearch}>
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Szukaj grup po nazwie" />
              <button type="submit">Szukaj</button>
            </form>
            <div className="search-results">
              {filteredGroups.map(group => (
                <div key={group.id} className="result-row">
                  <img src={group.image ? `http://localhost:5001/uploads/groups/${group.image}` : '/uploads/groups/default-group.png'} alt={group.name} />
                  <span className="group-name">{group.name}</span>
                  <span className="privacy">({group.privacy})</span>
                  {group.joined ? (
                    <button className="joined-btn" disabled>Dolaczono</button>
                  ) : joiningGroupIds.includes(group.id) ? (
                    <button className="joined-btn" disabled>Wysylanie...</button>
                  ) : group.membershipStatus === 'pending' || group.pending ? (
                    <button className="joined-btn" disabled>Poproszono o dolaczenie</button>
                  ) : (
                    <button className="join-btn" onClick={() => handleJoin(group.id)}>
                      {group.privacy === 'private' ? 'Wyslij prosbe' : 'Dolacz'}
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
        <div className="manage-panel-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setManagePanelOpen(false)}>
          <div className="manage-panel" style={{
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '16px',
            width: '500px',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            animation: 'fadeIn 0.3s ease-in-out'
          }} onClick={e => e.stopPropagation()}>
            <button className="close-btn" style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#888',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#333'}
            onMouseOut={(e) => e.target.style.color = '#888'}
            onClick={() => setManagePanelOpen(false)}>×</button>
            <div className="manage-panel-header" style={{
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '600',
                color: '#333'
              }}>Zarzadzanie grupa: {manageGroup.name}</h2>
              <img src={manageGroup.image ? `http://localhost:5001/uploads/groups/${manageGroup.image}` : '/uploads/groups/default-group.png'} alt={manageGroup.name} style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                margin: '1rem auto',
                objectFit: 'cover',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
              }} />
            </div>
            <div className="privacy-row" style={{
              marginBottom: '1rem',
              fontSize: '1rem',
              color: '#555'
            }}>
              <strong>Prywatnosc:</strong> {manageGroup.privacy}
            </div>
            <div style={{
              margin: '1rem 0',
              width: '100%'
            }}>
              <strong style={{
                fontSize: '1.2rem',
                color: '#333'
              }}>Kto moze dodawac posty:</strong>
              <div style={{ marginTop: '0.7rem' }}>
                <select
                  value={postPermissionMode}
                  onChange={(e) => setPostPermissionMode(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '10px', border: '1px solid #ddd' }}
                >
                  <option value="all_members">Kazdy czlonek grupy</option>
                  <option value="selected_members">Tylko wybrane osoby</option>
                </select>
              </div>
              {postPermissionMode === 'selected_members' && (
                <div style={{
                  marginTop: '0.8rem',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  padding: '0.6rem'
                }}>
                  {postPermissionMembers.length === 0 ? (
                    <div style={{ color: '#888' }}>Brak czlonkow w grupie.</div>
                  ) : (
                    postPermissionMembers.map(member => (
                      <label key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
                        <input
                          type="checkbox"
                          checked={allowedPostUserIds.includes(member.id)}
                          onChange={() => handleToggleAllowedUser(member.id)}
                        />
                        <span>{member.username}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
              <button
                className="manage-btn"
                onClick={savePostPermissions}
                disabled={savingPostPermissions}
                style={{ marginTop: '0.75rem', width: '100%' }}
              >
                {savingPostPermissions ? 'Zapisywanie...' : 'Zapisz ustawienia publikowania'}
              </button>
            </div>
            <div style={{
              margin: '1rem 0',
              width: '100%'
            }}>
              <strong style={{
                fontSize: '1.2rem',
                color: '#333'
              }}>Oczekujace prosby o dolaczenie:</strong>
              {pendingRequests.length === 0 ? (
                <div style={{
                  color: '#888',
                  marginTop: '8px',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>Brak oczekujacych prosb.</div>
              ) : (
                <div className="pending-requests-list" style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  marginTop: '1rem'
                }}>
                  {pendingRequests.map(user => (
                    <div key={user.id} className="pending-request-row" style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '1rem',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '12px',
                      backgroundColor: '#f9f9f9',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f9f9f9'}>
                      <img src={user.image ? `http://localhost:5001/uploads/${user.image}` : '/uploads/users/default-avatar.png'} alt={user.username} style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        marginRight: '1rem',
                        objectFit: 'cover'
                      }} />
                      <span className="username" style={{
                        flex: 1,
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#333'
                      }}>{user.username}</span>
                      <div className="action-btns" style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <button className="accept-btn" style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          background: 'linear-gradient(90deg, #34C759, #28a745)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                        }}
                        onClick={() => handleRequestAction(user.id, 'accept')}>Akceptuj</button>
                        <button className="reject-btn" style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '12px',
                          background: 'linear-gradient(90deg, #FF3B30, #dc3545)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
                        }}
                        onClick={() => handleRequestAction(user.id, 'reject')}>Odrzuc</button>
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