import React, { useState } from 'react';
import axios from 'axios';
import '../styles/groups.scss';

const CreateGroup = () => {
  const [createData, setCreateData] = useState({ name: '', description: '', privacy: 'public', image: null });
  const [createStatus, setCreateStatus] = useState('');

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
    } catch {
      setCreateStatus('Failed to create group');
    }
  };

  return (
    <div className="groups-page">
      <div className="create-section">
        <h2>Create Group</h2>
        <form onSubmit={handleCreate}>
          <input required placeholder="Group Name" value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })} />
          <textarea placeholder="Description" value={createData.description} onChange={e => setCreateData({ ...createData, description: e.target.value })} style={{ fontFamily: 'inherit', fontSize: 'inherit', resize: 'none' }} />
          <select value={createData.privacy} onChange={e => setCreateData({ ...createData, privacy: e.target.value })}>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="open">Open</option>
          </select>
          <input type="file" accept="image/*" onChange={e => setCreateData({ ...createData, image: e.target.files[0] })} />
          <button type="submit">Create Group</button>
          {createStatus && <div className="status">{createStatus}</div>}
        </form>
      </div>
    </div>
  );
};

export default CreateGroup; 