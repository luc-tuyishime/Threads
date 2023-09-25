// This is the layout for the auth Routes

import { dark } from '@clerk/themes'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'

import '../globals.css'

export const metadata = {
	title: 'Threads',
	description: 'A Next.js 13 Meta Threads application',
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<ClerkProvider
			appearance={{
				baseTheme: dark,
			}}>
			<html lang="en">
				<body className={`${inter.className} bg-dark-1`}>{children}</body>
			</html>
		</ClerkProvider>
	)
}

// we create component folder outside of app because inside app
// we put files and folder which we want next JS to render on the home page
