const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

console.log('connecting to ', url)
mongoose.connect(url)
    .then(result => {
        console.log('connected to mongoDB')
    })
    .catch(err => {
        console.log('error connecting to MongoDB:', err.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3
    },
    number: {
        type: String,
        required: true
    },
  });
  //toJSON is automactically called by JSON.stringify, which is called by express' JSON()
  personSchema.set('toJSON', { 
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
  })

module.exports = mongoose.model('Person', personSchema);