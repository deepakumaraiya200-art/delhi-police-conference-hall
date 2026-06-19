import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorOpen,
  Calendar,
  Plus,
  ClipboardList,
  Radio,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/rooms', label: 'Rooms', icon: DoorOpen },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/book', label: 'Book Room', icon: Plus },
  { path: '/my-bookings', label: 'My Bookings', icon: ClipboardList },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-neutral-500/30 bg-[#535bad] transition-all duration-300 ease-in-out flex flex-col',
          collapsed ? 'w-[68px]' : 'w-[260px]'
        )}
      >
        {/* Logo Section */}
        <div className={cn(' items-center h-30 px-1  border-b border-neutral-500/30', collapsed ? 'justify-center' : 'gap-3')}>
 <div className='flex flex-col items-center'>
          <img
            src='https://ik.imagekit.io/qwzhnpeqg/delhi%20police/Screenshot_2026-06-10_194556-removebg-preview.png'
            className='h-15 mt-1 w-auto'
            alt='Delhi Police'
          />
          <div className='flex flex-col leading-snug items-center mt-1'>
            <span className='text-white   font-bold text-md'>
              Delhi <span className='text-red-500 font-bold text-md'>Police</span>
            </span>
            <div className='text-neutral-500 text-sm mb-4 text-white'>Conference Hall Booking System</div>
          </div>
        </div>        
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              const link = (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center  gap-3 border-neutral-500/30 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-[#535bad]  bg-white '
                      : 'text-white  hover:bg-sidebar-hover',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
                  {!collapsed && <span>{item.label}</span>}
                  {item.path === '/live' && !collapsed && (
                    <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                  )}
                </NavLink>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return link;
            })}
          </div>
        </nav>

        <Separator />

        {/* Collapse Toggle */}
      
      </aside>
    </TooltipProvider>
  );
}
