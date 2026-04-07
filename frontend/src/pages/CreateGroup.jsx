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
      setCreateStatus('Grupa zostala utworzona!');
      setCreateData({ name: '', description: '', privacy: 'public', image: null });
    } catch {
      setCreateStatus('Nie udalo sie utworzyc grupy');
    }
  };

  return (
    <div className="groups-page">
      <div className="create-section">
        <h2>Utworz grupe</h2>
        <form onSubmit={handleCreate}>
          <input required placeholder="Nazwa grupy" value={createData.name} onChange={e => setCreateData({ ...createData, name: e.target.value })} />
          <textarea placeholder="Opis" value={createData.description} onChange={e => setCreateData({ ...createData, description: e.target.value })} style={{ fontFamily: 'inherit', fontSize: 'inherit', resize: 'none' }} />
          <select value={createData.privacy} onChange={e => setCreateData({ ...createData, privacy: e.target.value })}>
            <option value="public">Publiczna</option>
            <option value="private">Prywatna</option>
            <option value="open">Otwarta</option>
          </select>
          <input type="file" accept="image/*" onChange={e => setCreateData({ ...createData, image: e.target.files[0] })} />
          <button type="submit">Utworz grupe</button>
          {createStatus && <div className="status">{createStatus}</div>}
        </form>
      </div>
    </div>
  );
};

export default CreateGroup; 