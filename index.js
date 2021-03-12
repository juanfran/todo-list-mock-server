const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const WebSocket = require('ws');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(cors());

const connections = new Map();

const wss = new WebSocket.Server({
    port: 8080,
});

wss.on('connection', function connection(ws) {
    const id = uuidv4();
    connections.set(id, ws);
    ws.send(JSON.stringify({msg: 'connected'}));
});

let todos = [
    {id: 0, name: 'to do 1', completed: false},
    {id: 1, name: 'to do 2', completed: true},
];

app.get('/todos', function(req, res) {
    const name = req.query.name;

    if (name) {
        const filterTodos = todos.filter((todo) => todo.name.includes(name));
        res.json(filterTodos);

        return
    }

    res.json(todos);
});

function sendToAll(msg) {
    for (const connection of connections.values()) {
        connection.send(JSON.stringify(msg));
    }
}

app.post('/todos', function(req, res) {
    const newData = {
        ...req.body,
        completed: false,
    };

    const sameTask = todos.find((todo) => todo.name === newData.name);

    if (sameTask) {
        res.status(400).json({msg: 'task already created'});
        return;
    }

    const lastTodo = todos.reverse()[0]
    let lastTodoId = 0;

    if (lastTodo) {
        lastTodoId = lastTodo.id + 1;
    }

    newData.id = lastTodoId

    todos.push(newData);

    sendToAll({type: 'new-task', task: newData});

    res.json(newData);
});


app.patch('/todos/:id', function(req, res) {
    const id = Number(req.params.id);

    todos = todos.map((todo) => {
        if (todo.id === id) {
            return {
                ...todo,
                ...req.body
            }
        }

        return todo;
    });

    const task = todos.find((todo) => todo.id === id);

    sendToAll({type: 'update-task', task});

    res.json(task);
});


app.delete('/todos/:id', function(req, res) {
    const id = Number(req.params.id);

    todos = todos.filter((todo) => todo.id !== id);

    sendToAll({type: 'delete-task', id});

    res.json({});
});

app.listen(3000);