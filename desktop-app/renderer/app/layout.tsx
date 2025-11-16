import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insightful Time Tracker',
  description: 'Track your time on projects and tasks',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
