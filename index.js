const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

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

app.post('/todos', function(req, res) {
    const newData = {
        ...req.body,
        completed: false,
    };

    const sameTask = todos.find((todo) => todo.name === newData.name);

    if (sameTask) {
        res.status(400).json({error: 'task already created'});
        return;
    }

    const lastTodo = todos.reverse()[0]
    let lastTodoId = 0;

    if (lastTodo) {
        lastTodoId = lastTodo.id + 1;
    }

    newData.id = lastTodoId

    todos.push(newData);

    res.json(newData);
});


app.patch('/todos/:id', function(req, res) {
    const id = req.params.id;

    todos = todos.map((todo) => {
        if (todo.id === id) {
            return {
                ...todo,
                ...req.body
            }
        }

        return todo;
    });

    res.sendStatus(200);
});


app.delete('/todos/:id', function(req, res) {
    const id = req.params.id;

    todos = todos.filter((todo) => todo.id != id);

    res.sendStatus(200);
});

app.listen(3000);