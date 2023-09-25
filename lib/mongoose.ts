import mongoose from 'mongoose'

let isConnected = false // Variable to check if mongoose is connected

console.log('process ==>>>', process.env.MONGODB_URL)

export const connectToDB = async () => {
	mongoose.set('strictQuery', true)
	// if (!process.env.MONGOBD_URL) return console.log('MONGODB_URL NOT FOUND')
	// if (isConnected) return console.log('Already connected to MongoDB')

	try {
		await mongoose.connect(
			'mongodb+srv://jeanluc:Mauricetteluc10!@lucas.vo2znkq.mongodb.net/?retryWrites=true&w=majority',
		)

		isConnected = true

		console.log('connected to MongoDB')
	} catch (error) {
		console.log('Error =>>', error)
	}
}
