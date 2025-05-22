import BottomNavbar from "../BottomNavbar";


interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content with bottom padding to account for navbar */}
      <main className="pb-20">{children}</main>

      {/* Fixed bottom navbar */}
      <BottomNavbar />
    </div>
  );
}
