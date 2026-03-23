import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-6 text-gray-300">The page you are looking for does not exist.</p>
      <Link href="/" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">
        Go home
      </Link>
    </div>
  );
}
