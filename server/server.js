// server/server.js
const app = require('./app'); // Importing app from app.js
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});