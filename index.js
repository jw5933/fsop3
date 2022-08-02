const express = require("express")
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(express.json())
app.use(cors)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
morgan.token(
    "body",
    (req) => JSON.stringify(req.body)
)

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

app.get("/",
    (request, response) => {
        response.send('<h1>Hello World!</h1>')
    }
)

app.get("/api/persons",
    (request, response) => {
        response.json(persons)
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
    (request, response) => {
        const id = Number(request.params.id)
        const entry = persons.find(person => person.id === id)
        if (entry)
            response.json(entry)
        else
            response.status(404).end()
    }
)

app.delete("/api/persons/:id",
    (request, response) => {
        const id = Number(request.params.id)
        persons = persons.filter(person => person.id !== id)
        response.status(204).end()
    }
)

app.post("/api/persons",
    (request, response) => {
        const body = request.body
        if (!body.name || !body.number){
            return response.status(404).json(
                {error: 'Missing name or number.'}
            )
        }

        const re = new RegExp(`^${body.name}`, 'i')
        if (persons.filter(person => person.name.match(re)).length > 0){
            return response.status(404).json(
                {error: 'Entry already exists. Name must be unique.'}
            )
            .end()
        }

        const newId = Math.floor(Math.random()*(100) + 1);
        if (persons.find(person => person.id === newId)){
            return response.status(404).json(
                {error: 'Could not generate appropriate id.'}
            )
        }

        const entry = {
            id: newId,
            name: body.name,
            number: body.number
        }
        persons = persons.concat(entry)
        response.json(persons)
    }
)

const PORT = process.env.PORT || 3001

app.listen(
    PORT, () => {
        console.log(`Server running on port ${PORT}`)
    }
)
