const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/questions', async (req, res) => {
    const data = await fs.readFile(path.join(__dirname, 'questions.json'), 'utf8');
    res.json(JSON.parse(data));
});

app.post('/results', async (req, res) => {
    const newResult = req.body;
    const filePath = path.join(__dirname, 'results.json');
    let results = [];

    try {
        const data = await fs.readFile(filePath, 'utf8');
        if (data) results = JSON.parse(data);
    } catch (err) {
        results = [];
    }

    results.push(newResult);
    await fs.writeFile(filePath, JSON.stringify(results, null, 2));
    res.status(200).send('Result saved');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});