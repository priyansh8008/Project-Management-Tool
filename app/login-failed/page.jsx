export default function LoginFailedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-red-700 mb-2">Login Failed</h1>
        <p className="text-gray-600 mb-6">
          Your credentials were incorrect or your account is not verified.
        </p>
        <a
          href="/login"
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Try Again
        </a>
      </div>
    </div>
  );
}
