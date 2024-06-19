const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(cors())

app.use(express.json())
morgan.token('body',function(req,res){
    return JSON.stringify(req.body)
})

let persons = [
    {
        id:1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id:2,
        name: "Ada Lovelace",
        number: "39-44-5322523"
    },
    {
        id:3,
        name: "Dan Abramov",
        number: "12-43-234345"
    },
    {
        id:4,
        name: "Mary Poppendick",
        number: "39-23-6423122"
    }
] 


app.use(morgan('tiny',{
    skip: function(req,res) {return req.method === 'POST'}
}))
app.use(morgan(
    'method: :url :status :res[content-length] - :response-time ms :body',{
    skip: function(req,res) {return req.method !== 'POST'}
}))


app.get('/',(request,response) => {
    response.end()
})


app.get('/api/persons',(request,response) => {
    response.json(persons)
})

app.get('/info',(request,response) =>{
    const total = persons.length
    const date = Date()
    response.send(
        `
        <p>Phonebook has info for ${total} people</p>
        <p>${date}</p>
        `
    )
})

app.get('/api/persons/:id',(request,response) =>{
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }
})

app.delete('/api/persons/:id',(request,response) =>{
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})


const rndNewId = (min,max) =>{
    return Math.floor(Math.random()*max-min)+min
}

app.post('/api/persons',(request,response) =>{
    const body = request.body

    if(!body.name || persons.find(p => body.name === p.name)){
        if(body.name){
            return response.status(400).json({
                error: 'name must be unique'
            })
        }
        return response.status(400).json({
            error: 'name missing'
        })
    }else if(!body.number){
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = {
        id: rndNewId(1,10000),
        name: body.name,
        number: body.number
    }

    persons  = persons.concat(person)

    response.json(person)
})



const PORT = process.env.PORT || 3001
app.listen(PORT,() => {
    console.log(`server running on port ${PORT}`)
})