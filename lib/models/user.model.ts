import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
	id: { type: String, required: true },
	username: { type: String, required: true, unique: true },
	name: { type: String, required: true },
	image: String,
	bio: String,
	threads: [
		{
			// one user can have multiple references to specific threads store in the DB
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Threads',
		},
	],
	onboarded: {
		type: Boolean,
		default: false,
	},
	communities: [
		{
			// one user can belong to many communities
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Community',
		},
	],
})

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
