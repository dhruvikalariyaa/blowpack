const express = require('express');
const app = express();

// Test the users route
app.use('/api/users', require('./routes/users'));

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// List all routes
app._router.stack.forEach(function(r){
  if (r.route && r.route.path){
    console.log(r.route.path, Object.keys(r.route.methods));
  }
});

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});

