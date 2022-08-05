const mongoose = require('mongoose')
if (process.argv.length < 3) {
	console.log(`Please provide one of the following:
    get phonebook values -> node mongo.js <password>
    or add phonebook entry -> node mongo.js <password> <name> <value>`)
	process.exit(1)
}
if (process.argv.length > 5){
	console.log('Please place name between quotations and try again.')
	process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.vpdinbf.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
})

const Person = mongoose.model('Person', personSchema)
/*
Models are so-called constructor functions that create new JavaScript objects
based on the provided parameters. Since the objects are created with the
model's constructor function, they have all the properties of the model,
which include methods for saving the object to the database
*/

if (process.argv.length > 3){
	const name = process.argv[3]
	const val = String(process.argv[4])
	mongoose
		.connect(url)
		.then((result) => {
			console.log('connected', result)
			const person = new Person({
				name: name,
				number: val,
			})
			return person.save()
		})
		.then(() => {
			console.log(`Added ${name} ${val} to the phonebook.`)
			return mongoose.connection.close()
		})
		.catch((err) => console.log(err))
}
else{
	Person.find({}).then( result => {
		result.forEach(person => {
			console.log(person)
		})
		mongoose.connection.close()
	})
}