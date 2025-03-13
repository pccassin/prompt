export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-lg mb-8">
        The page you are looking for does not exist.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Return Home
      </a>
    </div>
  );
}
