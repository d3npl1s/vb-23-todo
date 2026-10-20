const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

let tasks = [];
let nextId = 0;


app.get('/', (req, res) => {
    res.send('TODOВась');

    res.send("1", req.method);
    res.send("2", req.url);
    res.send("3", req.params);
    res.send("4", req.body);
});

app.get("/tasks", (req, res) => {
    res.json(tasks);
})

app.post('/tasks', (req, res) => {
    const newTask = {
        id: nextId++, 
        text: req.body.text,
        isCompleted: false
    }

    tasks.push(newTask);

    res.json({
        status:  'ok',
        message: 'kakoeto soobshenie',
        task: newTask
    })
})

app.listen(PORT, () => {
    console.log('Сервер хас бин актив');
})

// req.method 
// req.url - /task
// localhost:3000/task
// localhost:3000/info

// req.params
// /tasks/5
// app.get("/tasks/:id", (req, res) => {
//     console.log(req.params.id);
// })

// req.query - { completed: "true"}

// /tasks?complited=true

// req.headers - заголовки запроса

// req.body - 

// POST /tasks
// Content-Type: application/json