// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "Project Management Tool",
  description: "Mini project management tool with custom authentication",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col items-center justify-center">
        {children}
      </body>
    </html>
  );
}
