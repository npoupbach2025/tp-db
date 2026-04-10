import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  auth?: { user: any; role: string };
  onLogout?: () => void;
}

export default function Layout({ children, auth, onLogout }: LayoutProps) {
  const roleBadgeColor: Record<string, string> = {
    administrateur: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    president: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    directeur: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    competiteur: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    evaluateur: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role={auth?.role} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30 px-3">
            <SidebarTrigger />
            {auth && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium hidden sm:inline">{auth.user.prenom} {auth.user.nom}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor[auth.role] || 'bg-gray-100 text-gray-600'}`}>
                    {auth.role}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Déconnexion</span>
                </Button>
              </div>
            )}
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
