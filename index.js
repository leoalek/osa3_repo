require('dotenv').config()
const express = require('express')
const app = express()
const Person = require('./models/person')

const morgan = require('morgan')
const cors = require('cors')


app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
morgan.token('body',function(req){
  return JSON.stringify(req.body)
})


const errorHandler = (error,request,response,next) => {
  console.error(error.message)
  if(error.name === 'CastError'){
    return response.status(400).send({ error: 'malformatted id' })
  }else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }else if(error.message === 'name missing'){
    return response.status(400).send({ error: 'name missing' })
  }else if (error.message === 'number missing'){
    return response.status(400).send({ error: 'number missing' })
  }

  next(error)
}

//for exercise 3.1
/*
let persons = [
  {
    id:1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id:2,
    name: 'Ada Lovelace',
    number: '39-44-5322523'
  },
  {
    id:3,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id:4,
    name: 'Mary Poppendick',
    number: '39-23-6423122'
  }
]
*/


app.use(morgan('tiny',{
  skip: function(req) {return req.method === 'POST'}
}))
app.use(morgan(
  'method: :url :status :res[content-length] - :response-time ms :body',{
    skip: function(req) {return req.method !== 'POST'}
  }))


//get people
app.get('/',(request,response) => {
  Person.find({}).then(() => {
    response.end()
  })
})

//list of people
app.get('/api/persons',(request,response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info',(request,response) => {
  const date = new Date()
  Person.find({}).then(persons => {
    response.send(
      `
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${date}</p>
        `
    )
  })


})

//get person w/ id
app.get('/api/persons/:id',(request,response,next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => next(error))
})

//delete person
app.delete('/api/persons/:id',(request,response,next) => {
  Person.findByIdAndDelete(request.params.id).then(() => {
    response.status(204).end()
  }).catch(error => next(error))
})

// random number generator (for id) for exercise 3.5
/*
const rndNewId = (min,max) => {
  return Math.floor(Math.random()*max-min)+min
}
*/

//add person
app.post('/api/persons',(request,response,next) => {
  const body = request.body



  const person = new Person ({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

app.put('/api/persons/:id',(request,response,next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new : true, runValidators: true, context:'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    }).catch(error => next(error))
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT,() => {
  console.log(`server running on port ${PORT}`)
})