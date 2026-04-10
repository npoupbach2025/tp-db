import { LayoutDashboard, Building2, Users, Trophy, Palette, Star, BarChart3, ClipboardList, Scale, DatabaseZap, FolderOpenDot, RotateCcw, Moon, Sun } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useData } from "@/contexts/DataContext";
import { useState, useEffect } from "react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Accueil (commencer ici)", url: "/", icon: LayoutDashboard, recommended: true },
  { title: "Concours", url: "/concours", icon: Trophy, recommended: true },
  { title: "Résultats", url: "/resultats", icon: BarChart3, recommended: true },
  { title: "Dossier TP", url: "/tp", icon: FolderOpenDot, recommended: true },
  { title: "Console SQL TP", url: "/requetes-tp", icon: DatabaseZap },
  { title: "Dessins", url: "/dessins", icon: Palette },
  { title: "Évaluations", url: "/evaluations", icon: Star },
  { title: "Inscriptions", url: "/inscriptions", icon: ClipboardList },
  { title: "Jury", url: "/jury", icon: Scale },
  { title: "Clubs", url: "/clubs", icon: Building2 },
  { title: "Utilisateurs", url: "/utilisateurs", icon: Users },
];

const roleAllowedPaths: Record<string, string[]> = {
  administrateur: ["/", "/clubs", "/utilisateurs", "/concours", "/dessins", "/evaluations", "/resultats", "/inscriptions", "/jury", "/requetes-tp", "/tp"],
  directeur: ["/", "/concours", "/dessins", "/evaluations", "/resultats", "/inscriptions", "/jury", "/requetes-tp", "/tp"],
  president: ["/", "/concours", "/dessins", "/evaluations", "/resultats", "/inscriptions", "/jury", "/requetes-tp", "/tp"],
  competiteur: ["/", "/concours", "/dessins", "/resultats", "/tp"],
  evaluateur: ["/", "/concours", "/dessins", "/evaluations", "/resultats", "/tp"],
};

interface AppSidebarProps {
  role?: string;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { resetData } = useData();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const allowedPaths = role ? (roleAllowedPaths[role] || ["/"]) : ["/"];
  const visibleItems = navItems.filter(item => allowedPaths.includes(item.url));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <div className="px-3 py-4 mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                  <Palette className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-sidebar-foreground">Concours Dessins</span>
                  <span className="text-[10px] text-sidebar-foreground/50">Inter-Clubs</span>
                </div>
              </div>
              <div className="mt-3 rounded-md border border-sidebar-border/60 bg-sidebar-accent/30 p-2 text-[11px] leading-relaxed text-sidebar-foreground/80">
                <p className="font-medium">Parcours conseillé prof :</p>
                <p>1) Accueil → 2) Concours → 3) Résultats → 4) Dossier TP</p>
              </div>
            </div>
          )}
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent/50 transition-colors duration-150"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate">{item.title}</span>
                          {item.recommended ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-sidebar-primary/15 text-sidebar-primary">conseillé</span> : null}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-1 p-2">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={() => setDark(d => !d)}
          >
            {dark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
            {!collapsed && <span className="ml-2">{dark ? 'Mode clair' : 'Mode sombre'}</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-sidebar-accent/50"
            onClick={resetData}
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="ml-2">Réinitialiser</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
