const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const isUserCreated = users.find(user => user.username === username)

  if (!isUserCreated) return response.status(404).json({error: 'User do not exists!'})
  
  request.user = isUserCreated;

  return next();
}


app.post('/users', (request, response) => {
  const {name, username} = request.body
  const isUserCreated = users.find(user => user.username === username)
  if (isUserCreated) return response.status(400).json({error: 'User already exists!'})

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos',checksExistsUserAccount, (request, response) => {
  const {user} = request;
  
  return response.status(200).json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;

  const isTodoValid = user.todos.find((todo) => todo.id === id)

  if (!isTodoValid) return response.status(404).json({error: 'To-do not found!'})

  isTodoValid.title = title;
  isTodoValid.deadline = deadline;

  return response.status(200).json(isTodoValid)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const isTodoValid = user.todos.find((todo) => todo.id === id)

  if (!isTodoValid) return response.status(404).json({error: 'To-do not found!'})

  
  isTodoValid.done = true;


  return response.status(200).json(isTodoValid)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const isTodoValid = user.todos.find((todo) => todo.id === id)

  if (!isTodoValid) return response.status(404).json({error: 'To-do not found!'})

  user.todos.splice(isTodoValid, 1);

  return response.status(204).send()
});

module.exports = app;