import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/store/notificationStore';
import { useUserStore } from '@/store/userStore';
import { cn, getInitials } from '@/lib/utils';
import { format } from 'date-fns';
import { MdOutlineNightlight } from "react-icons/md";
import { GoSun } from "react-icons/go";
import { IoMdNotificationsOutline } from "react-icons/io";

interface NavbarProps {
  onMenuToggle: () => void;
  sidebarCollapsed: boolean;
}

export function Navbar({ onMenuToggle, sidebarCollapsed }: NavbarProps) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const { currentUser, logout } = useUserStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 border-b bg-background/80 backdrop-blur-md transition-all duration-300',
        sidebarCollapsed ? 'left-[68px]' : 'left-[260px]',
        'max-lg:left-0'
      )}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Mobile menu button and search */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms, bookings..."
              className="pl-9 bg-neutral-400/5  border border-neutral-500/20  rounded-2xl "
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center ">
          {/* Dark Mode Toggle */}
          <Button variant="ghost" onClick={toggleDarkMode} className="rounded-full">
            {darkMode ? <GoSun className="h-4 w-4" /> : <MdOutlineNightlight className="h-15 w-15" />}
          </Button>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-semibold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-auto py-1"
                    onClick={() => markAllAsRead()}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-3 cursor-pointer hover:bg-muted/50 transition-colors',
                          !notif.read && 'bg-primary/5'
                        )}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <p className="text-sm">{notif.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(notif.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src='https://ik.imagekit.io/qwzhnpeqg/delhi%20police/Screenshot_2026-06-10_194556-removebg-preview.png?updatedAt=1781100986877' alt={currentUser?.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {currentUser ? getInitials(currentUser.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => { logout(); navigate('/login'); }}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
