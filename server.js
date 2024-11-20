const http = require('http');
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data', 'hospitals.json');

const readData = () => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (url === '/hospitals') {
    if (method === 'GET') {
      const hospitals = readData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(hospitals));
    } else if (method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const newHospital = JSON.parse(body);
        const hospitals = readData();
        newHospital.id = hospitals.length + 1;
        hospitals.push(newHospital);
        writeData(hospitals);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hospital added successfully!' }));
      });
    } else if (method === 'PUT') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const updatedHospital = JSON.parse(body);
        const hospitals = readData();
        const index = hospitals.findIndex(h => h.id === updatedHospital.id);
        if (index !== -1) {
          hospitals[index] = updatedHospital;
          writeData(hospitals);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Hospital updated successfully!' }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Hospital not found!' }));
        }
      });
    } else if (method === 'DELETE') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const { id } = JSON.parse(body);
        const hospitals = readData();
        const filteredHospitals = hospitals.filter(h => h.id !== id);
        writeData(filteredHospitals);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Hospital deleted successfully!' }));
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Method not allowed!' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found!' }));
  }
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
