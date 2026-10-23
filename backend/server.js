const express = require('express');

const app = express();
const PORT = 3000;

app.use(express.json());

// CORS — разрешаем запросы с любого Origin (требование задания)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// Логирование всех входящих запросов в консоль
app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

// ОБРАБОТКА PREFLIGHT (OPTIONS) — ДОБАВЛЕНО 23.10.2026.
// Браузер перед PATCH/DELETE/POST-с-JSON шлёт служебный запрос OPTIONS
// («разведка»: какие методы и заголовки можно). Без этого блока Express
// ответит 404 и браузер ЗАБЛОКИРУЕТ настоящий запрос — связка не заработает.
// Hoppscotch это не показывал, потому что расширение шлёт запрос в обход.
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return res.sendStatus(204); // 204 = «понял, разрешаю, без тела»
    }
    next();
});

// "База данных" — пока массив в памяти (SQLite отложен по договорённости)
let tasks = [];
let nextId = 1;

// GET /tasks — с query-параметрами filter / page / limit
//   /tasks                          → все задачи
//   /tasks?filter=active            → только невыполненные
//   /tasks?filter=completed         → только выполненные
//   /tasks?page=2&limit=5           → срез для пагинации
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

// POST /tasks — создать задачу.
// Mass assignment: сохраняем тело запроса как есть, лишние поля не отбрасываем.
// id сервер присваивает сам (перетирает любой id из тела).
app.post('/tasks', (req, res) => {
    const newTask = { ...req.body, id: nextId++ };
    tasks.push(newTask);
    res.json(newTask);
});

// PATCH /tasks/:id — частично обновить (например, пометить completed)
app.patch('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ error: 'Задача не найдена' });
    }

    Object.assign(task, req.body); // переносим новые поля поверх старых
    res.json(task);
});

// DELETE /tasks/completed — удалить все выполненные.
// ВАЖНО: этот маршрут должен стоять ВЫШЕ /tasks/:id,
// иначе слово "completed" поймается как :id.
app.delete('/tasks/completed', (req, res) => {
    tasks = tasks.filter(task => !task.completed);
    res.json({ status: 'ok' });
});

// DELETE /tasks/:id — удалить одну задачу
app.delete('/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    tasks = tasks.filter(task => task.id !== id);
    res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.send('TODOВась');
});

app.listen(PORT, () => {
    console.log('Сервер запущен: http://localhost:' + PORT);
});
