export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Render login page without any sidebar or dashboard chrome
  return <>{children}</>
}
