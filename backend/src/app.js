const express = require("express")
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const dotenv = require('dotenv');

dotenv.config();

const app = express();

//security middleware
app.use(helmet());

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-url.com' 
    : 'http://localhost:5173', // Vite default port
  credentials: true
}));

//Logging
if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'));
}

//Body parsing
app.use(express.json());
app.use(express.urlencoded({extended: true}));

mongoose.connect(process.env.MONGODB_URI)
    .then(()=>console.log("Mongo db connected"))
    .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Property Platform API'
  });
});

//routes, ADDED here laterr

// 404 not found handler, maybe add a nice looking static page here
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`erver running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
