'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ShoppingCart,
  PackagePlus,
  History,
  Siren,
  BookOpenCheck,
  FilePlus,
} from 'lucide-react';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sales', label: 'Sales Entry', icon: ShoppingCart },
  { href: '/purchases', label: 'Purchase Entry', icon: PackagePlus },
  { href: '/books/add', label: 'Add Book', icon: FilePlus },
  { href: '/transactions', label: 'Transactions', icon: History },
  { href: '/alerts', label: 'Stock Alerts', icon: Siren },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <BookOpenCheck className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold font-headline">SheetSync</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <p className="text-xs text-center text-muted-foreground p-4">
          &copy; {new Date().getFullYear()} SheetSync Inc.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
