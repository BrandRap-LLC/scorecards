import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Company Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          The company you're looking for doesn't exist in our SEO database, 
          or there might be an error in the URL.
        </p>
        <div className="space-y-4">
          <Link 
            href="/seo"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to SEO Dashboard
          </Link>
          <div className="text-sm text-gray-500">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}