require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); 
const db = require('./models/db');
const userRoutes = require('./routes/userRoutes.js');
const eventRoutes = require('./routes/eventRoutes.js');
const groupRoutes = require('./routes/groupRoutes');

const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/groups', express.static('uploads/groups'));
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/groups', groupRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  