require('dotenv').config()
const express = require("express")
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const { response } = require('express')

let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
//using next executes the middleware succeeding current
//if theres none
morgan.token(
    "body",
    (req) => JSON.stringify(req.body)
)

app.get("/",
    (request, response) => {
        response.send('<h1>Hello World!</h1>')
    }
)

app.get("/api/persons",
    (request, response) => {
        Person.find({}).then (persons => {
            response.json(persons)
        })
    }
)

app.get("/info",
    (request, response) => {
        response.send(
            `Phonebook has ${persons.length} entries.
            <br>
            ${new Date().toLocaleString('en-US', {
            timeZone: 'America/Los_Angeles',
          })}`
        );
    }
)

app.get("/api/persons/:id",
    (request, response, next) => {
        // const id = Number(request.params.id)
        // const entry = persons.find(person => person.id === id)
        // if (entry)
        //     response.json(entry)
        // else
        //     response.status(404).end()
        Person.findById(request.params.id)
        .then(entry => {
            if (entry) response.json(entry)
            else response.status(404).end()
        })
        // .catch(err =>{
        //     console.log(err)
        //     response.status(400).send({error: "malformed id"})
        //     //500 internal server error
        // })
        .catch(error => next(error))
    }
)

app.delete("/api/persons/:id",
    (request, response, next) => {
        // const id = Number(request.params.id)
        // persons = persons.filter(person => person.id !== id)
        // response.status(204).end()
        Person.findByIdAndRemove(request.params.id)
            .then(result => {
                response.status(204).end()
            })
            .catch(error => next(error))
    }
)

app.post("/api/persons",
    (request, response, next) => {
        const body = request.body
        const re = new RegExp(`^${body.name}$`, 'i')
        Person.find({name: re})
        .then (persons => {
            if (persons)
                return response.status(400).send({error: `${body.name} already exists in the phonebook.`})
            else{
                const entry = new Person({
                    name: body.name,
                    number: body.number,
                })
        
                entry.save()
                    .then(savedPerson => {
                        response.json(savedPerson)
                    })
                    .catch(error => next(error))
            }
        })
    }
)

app.put("/api/persons/:id", 
    (request, response, next) => {
        const body = request.body
        const person = {
            name: body.name,
            number: body.number,
        }

        Person.findByIdAndUpdate(request.params.id, person, {new: true, runValidators: true, context: 'query'})
            .then(person => {
                response.json(person)
            })
            .catch(error => next(error))
    }
)
/*
By default, the updatedNote parameter of the event handler receives the original 
document without the modifications. We added the optional { new: true } parameter,
which will cause our event handler to be called with the new modified document 
instead of the original.
*/

const PORT = process.env.PORT

app.listen(
    PORT, () => {
        console.log(`Server running on port ${PORT}`)
    }
)

const errorHandler = (error, request, response, next) =>{
    if (error.name === "CastError"){
        return response.status(400).send({error: "malformed id"})
    }
    if (error.name === "ValidationError"){
        return response.status(400).send(error.message)
    }
    next(error)
}
app.use(errorHandler)