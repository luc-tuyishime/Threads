'use server'
import Thread from '../models/thread.model'
import User from '../models/user.model'
import { connectToDB } from '../mongoose'
import { revalidatePath } from 'next/cache'

interface Params {
	text: string
	author: string
	communityId: string | null
	path: string
}

export async function createThread({
	text,
	author,
	communityId,
	path,
}: Params) {
	try {
		connectToDB()
		const createdThread = await Thread.create({ text, author, community: null })

		// Update user model
		// Push the thread to that specific user who created the thread
		await User.findByIdAndUpdate(author, {
			$push: { threads: createdThread._id },
		})

		revalidatePath(path) // To make sure our changes happens immediately on the website
	} catch (error: any) {
		throw new Error(`Error creating thread ${error.message}`)
	}
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
	connectToDB()

	// Calculate the number of posts to skip
	const skipAmount = (pageNumber - 1) * pageSize

	// fetch posts that have no parents (top-level threads...)
	const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
		.sort({ createdAt: 'desc' })
		.skip(skipAmount)
		.populate({ path: 'author', model: User })
		.populate({
			path: 'children',
			populate: {
				path: 'author',
				model: User,
				select: '_id name parentId image',
			},
		})

	const totalPostsCount = await Thread.countDocuments({
		parentId: { $in: [null, undefined] },
	})

	const posts = await postsQuery.exec()

	const isNext = totalPostsCount > skipAmount + posts.length

	return { posts, isNext }
}

export async function fetchThreadById(id: string) {
	connectToDB()
	try {
		// TODO: Populate Community
		const thread = await Thread.findById(id)
			.populate({ path: 'author', model: User, select: '_id id name image' })
			.populate({
				path: 'children',
				populate: [
					{
						path: 'author',
						model: User,
						select: '_id id name image',
					},
					{
						path: 'children',
						model: Thread,
						populate: {
							path: 'author',
							model: User,
							select: '_id id name image',
						},
					},
				],
			})
			.exec()
		return thread
	} catch (error: any) {
		throw new Error(`Error fetching new thread ${error.message}`)
	}
}

export async function addCommentToThread(
	threadId: string,
	commentText: string,
	userId: string,
	path: string,
) {
	connectToDB()
	try {
		// Find the original thread by its id
		const originalThread = await Thread.findById(threadId)

		if (!originalThread) {
			throw new Error('Thread not found')
		}

		// create a new thread with the comment text
		const commentThread = new Thread({
			text: commentText,
			author: userId,
			parentId: threadId,
		})

		// Save the new thread
		const saveCommentThreaD = await commentThread.save()

		// update the original thread to include the new comment
		originalThread.children.push(saveCommentThreaD._id)

		// Save the original thread
		await originalThread.save()

		revalidatePath(path)
	} catch (error: any) {
		throw new Error(`error message ${error.message}`)
	}
}

export async function fetchUserPosts(userId: string) {
	try {
		connectToDB()

		// find all threads authored by the user with the given id

		// Populate Community
		const threads = await User.findOne({ id: userId }).populate({
			path: 'threads',
			model: Thread,
			populate: {
				path: 'children',
				model: 'Thread',
				populate: {
					path: 'author',
					model: 'User',
					select: 'id name image',
				},
			},
		})
		return threads
	} catch (error: any) {
		throw new Error(`error message ${error.message}`)
	}
}
