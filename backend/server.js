const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());


app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});


app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});


let tasks = [];
let nextId = 0;


app.get('/tasks', (req, res) => {
    const filter = req.query.filter;
    const page = req.query.page;
    const limit = req.query.limit;

    let result = tasks;

    if (filter === 'active') {
        result = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
        result = tasks.filter(task => task.completed);
    }

    if (limit) {
        const pageNumber = Number(page) || 1;
        const limitNumber = Number(limit);
        const start = (pageNumber - 1) * limitNumber;
        result = result.slice(start, start + limitNumber);
    }

    res.json(result);
});


app.post('/tasks', (req, res) => {
    const newTask = { ...req.body, id: nextId++ };
    tasks.push(newTask);
    res.json(newTask);
});


app.patch('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }

    Object.assign(task, req.body); 
    res.json(task);
});


app.delete('/tasks/completed', (req, res) => {
    tasks = tasks.filter(task => !task.completed);
    res.json({ status: 'ok' });
});


app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    tasks = tasks.filter(task => task.id !== id);
    res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.send('TODOВась');
});

app.listen(PORT, () => {
    console.log('запущено: http://localhost:' + PORT);
});

// app.patch('/tasks/:id', (req, res) => {
//     const id = Number(req.params.id);
//     const task = tasks.find((task) => task.id === id);
//     task.text = req.body.text;
//     res.json(task);
// })