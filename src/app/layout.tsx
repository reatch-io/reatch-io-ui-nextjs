import { AppSidebar } from "@/components/app-sidebar"
import "./globals.css"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <html lang="en">
      <body>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex-1 grow">
              <SidebarTrigger />
              <div className="pt-6 pr-6 pl-6 pb-2">{children}</div>
            </div>
          </SidebarProvider>
      </body>
    </html>
  )
}