require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./models/db');
const userRoutes = require('./routes/userRoutes.js');
const eventRoutes = require('./routes/eventRoutes.js');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));