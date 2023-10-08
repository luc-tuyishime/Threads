'use server'
import { FilterQuery } from 'mongoose'
import { revalidatePath } from 'next/cache'
import Thread from '../models/thread.model'
import User from '../models/user.model'
import { connectToDB } from '../mongoose'

interface Params {
	userId: string
	username: string
	name: string
	bio: string
	image: string
	path: string
}

export async function updateUser({
	userId,
	username,
	name,
	bio,
	image,
	path,
}: Params): Promise<void> {
	connectToDB()
	try {
		await User.findOneAndUpdate(
			{ id: userId },
			{
				username: username.toLowerCase(),
				name,
				bio,
				image,
				path,
				onboarded: true,
			},

			{ upsert: true },
		)

		if (path === '/profile/edit') {
			revalidatePath(path) //
		}
	} catch (error: any) {
		throw new Error(`Failed to create/update user: ${error.message}`)
	}
}

export async function fetchUser(userId: string) {
	try {
		connectToDB()
		return await User.findOne({ id: userId })
		// .populate({
		// 	path: 'communities',
		// 	model: Community
		// });
	} catch (error: any) {
		throw new Error('Failed to fetch message', error.message)
	}
}

export async function fetchUsers({
	userId,
	searchString = '',
	pageSize = 1,
	pageNumber = 20,
	sortBy = 'desc',
}: {
	userId: string
	searchString: string
	pageNumber?: number
	pageSize?: number
	sortBy?: any
}) {
	try {
		connectToDB()

		const skipAmount = (pageNumber - 1) * pageSize

		const regex = new RegExp(searchString, 'i')

		const query: FilterQuery<typeof User> = {
			// ne means not equal to
			id: { $ne: userId },
		}

		if (searchString.trim() !== '') {
			query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }]
		}

		const sortOptions = { createdAt: sortBy }
		const usersQuery = User.find(query)
			.sort(sortOptions)
			.skip(skipAmount)
			.limit(pageSize)
		const totalUsersCount = await User.countDocuments(query)

		const users = await usersQuery.exec()
		const isNext = totalUsersCount > skipAmount + users.length
		return { users, isNext }
	} catch (error: any) {
		throw new Error(`error message ${error.message}`)
	}
}

export async function getActivity(userId: string) {
	try {
		connectToDB()
		// Fetch all threads created by the user with the given id
		const userThreads = await Thread.find({ author: userId })

		// Collect all the child thread ids (replies) from the 'children' field
		const childThreadsIds = userThreads.reduce((acc, userThread) => {
			console.log('acc ==>>>', acc)

			return acc.concat(userThread.children)
		}, [])
		const replies = await Thread.find({
			_id: { $in: childThreadsIds },
			author: { $ne: userId },
		}).populate({
			path: 'author',
			model: User,
			select: 'name image _id',
		})

		return replies
	} catch (error: any) {
		throw new Error(`failed to fetch activity ${error.message}`)
	}
}
