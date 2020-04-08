const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");


const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response, next) {
  const { method, url } = request

  const label = `[${method.toUpperCase()}] ${url}`

  console.log(label)

  return next()
}

function validadeId(request, response, next) {
  const { id } = request.params
  const repoIndex = repositories.findIndex(repo => repo.id === id)

  if (!isUuid(id)) {
    return response.status(400).json({error: 'Invalid ID'})
  }

  if (repoIndex < 0) {
    return response.status(400).json({error: 'No repositorie found with this ID'})
  }

  return next();
}

app.use(logRequests)

app.get("/repositories", (request, response) => {

  return response.json(repositories)
});

app.post("/repositories", (request, response) => {
  const { title, url, techs = [] } = request.body

  const newRepo = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(newRepo)

  return response.json(newRepo)
});

app.put("/repositories/:id", validadeId, (request, response) => {
  const { title, url, techs } = request.body
  const { id } = request.params

  const repoIndex = repositories.findIndex(repo => repo.id === id)
  const likes = repositories[repoIndex].likes

  const repo = {
    id,
    title,
    url,
    techs,
    likes
  }

  repositories[repoIndex] = repo

  return response.json(repo)
});

app.delete("/repositories/:id", validadeId, (request, response) => {
  const { id } = request.params
  
  const poorRepoIndex = repositories.findIndex(repo => repo.id === id)
  repositories.splice(poorRepoIndex, 1)

  return response.status(204).send()
});

app.patch("/repositories/:id/like", validadeId, (request, response) => {
  const { id } = request.params

  const repoIndex = repositories.findIndex(repo => repo.id === id)
  const repo = repositories[repoIndex]
  
  repo.likes++

  return response.json({likes: repo.likes})
});

module.exports = app;
