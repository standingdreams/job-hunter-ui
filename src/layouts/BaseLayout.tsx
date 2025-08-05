import { useRouterState } from '@tanstack/react-router';
import { ArrowLeft, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import { mockJobs, navigationItems } from '@/lib/mockData';

export function BaseLayout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const isMainRoute = routerState.location.pathname === '/';
  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="p-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">JobFinder</h2>
              <p className="text-muted-foreground text-sm">
                Find your dream job
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.active}>
                      <a href={item.href} className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Quick Stats</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-3 px-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Jobs</span>
                  <span className="font-medium">{mockJobs.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saved</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <SidebarTrigger className="-ml-1" />
          {!isMainRoute && (
            <>
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
            </>
          )}
        </header>

        <div className="flex-1 space-y-6 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
