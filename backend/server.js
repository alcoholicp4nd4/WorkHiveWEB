const express = require('express');
const app = express();
const PORT = 5000;

app.use(express.json());

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  console.log('Received:', username, email, password);

  // Dummy response for now
  res.json({
    success: true,
    user: { username, email },
  });
});

app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
