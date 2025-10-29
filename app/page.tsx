// app/page.tsx
export default function HomePage() {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-3xl font-bold">Welcome to Project Management Tool</h1>
      <p className="text-gray-600">Your simple project & team manager</p>
      <div className="flex justify-center gap-4 mt-6">
        <a href="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Register</a>
        <a href="/login" className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg">Login</a>
      </div>
    </div>
  );
}
