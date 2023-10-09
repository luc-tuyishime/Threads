import mongoose from 'mongoose'

let isConnected = false // Variable to check if mongoose is connected

export const connectToDB = async () => {
	mongoose.set('strictQuery', true)

	try {
		// @ts-ignore
		await mongoose.connect(process.env.MONGODB_URL)

		isConnected = true

		console.log('connected to MongoDB')
	} catch (error) {
		console.log('Error =>>', error)
	}
}
