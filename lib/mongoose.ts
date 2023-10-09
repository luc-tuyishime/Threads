import mongoose from 'mongoose'

let isConnected = false // Variable to check if mongoose is connected

export const connectToDB = async () => {
	mongoose.set('strictQuery', true)
	if (!process.env.MONGOBD_URL) return console.log('MONGODB_URL NOT FOUND')
	if (isConnected) return console.log('Already connected to MongoDB')

	console.log('process ==>>>', process.env.MONGODB_URL)

	try {
		// @ts-ignore
		await mongoose.connect(process.env.MONGODB_URL)

		isConnected = true

		console.log('connected to MongoDB')
	} catch (error) {
		console.log('Error =>>', error)
	}
}
