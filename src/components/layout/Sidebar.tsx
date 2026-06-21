import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  DoorOpen,
  Calendar,
  Plus,
  ClipboardList,
  Settings,
  Building2,
  Shield,
  Phone,
  Mail,
  X,
  BookOpen,
  BarChart3,
  Radio,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useUserStore } from '@/store/userStore';
import { getRankShort } from '@/types';

const ADMIN_NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/bookings', label: 'All Bookings', icon: BookOpen },
  { path: '/rooms', label: 'Rooms', icon: DoorOpen },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/live', label: 'Live Status', icon: Radio, dot: true },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const CARETAKER_NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/caretaker', label: 'My Rooms', icon: Home },
  { path: '/rooms', label: 'All Rooms', icon: DoorOpen },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const OFFICER_NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/book', label: 'Book Hall', icon: Plus },
  { path: '/my-bookings', label: 'My Bookings', icon: ClipboardList },
  { path: '/rooms', label: 'Browse Halls', icon: DoorOpen },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/live', label: 'Live Status', icon: Radio, dot: true },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [showAbout, setShowAbout] = useState(false);
  const { currentUser } = useUserStore();

  const navItems =
    currentUser?.role === 'admin'
      ? ADMIN_NAV
      : currentUser?.role === 'caretaker'
      ? CARETAKER_NAV
      : OFFICER_NAV;

  const roleLabel =
    currentUser?.role === 'admin'
      ? 'Admin'
      : currentUser?.role === 'caretaker'
      ? 'Caretaker'
      : getRankShort(currentUser?.role ?? 'user');

  const roleBgColor =
    currentUser?.role === 'admin'
      ? 'bg-red-500'
      : currentUser?.role === 'caretaker'
      ? 'bg-emerald-500'
      : 'bg-amber-500';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-neutral-500/30 bg-[#535bad] transition-all duration-300 ease-in-out flex flex-col',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className={cn('border-b border-neutral-500/80', collapsed ? 'py-3 px-2' : 'px-3 py-2')}>
        <div className="flex flex-col items-center">
          <img
            src="https://ik.imagekit.io/qwzhnpeqg/delhi%20police/Screenshot_2026-06-10_194556-removebg-preview.png"
            className="h-14 mt-1 w-auto"
            alt="Delhi Police"
          />
          {!collapsed && (
            <div className="flex flex-col leading-snug items-center mt-1 mb-2">
              <span className="text-white font-bold text-sm">
                Delhi <span className="text-red-400 font-bold text-sm">Police</span>
              </span>
              <div className="text-white/60 text-xs">Conference Hall Booking System</div>
              {currentUser && (
                <span className={cn('mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white', roleBgColor)}>
                  {roleLabel} Portal
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname === item.path || location.pathname.startsWith(item.path + '/') && item.path !== '/';
            const isActiveLoose = !item.exact && location.pathname.startsWith(item.path) && item.path !== '/';
            const active = item.exact ? location.pathname === '/' : isActiveLoose || location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive: navActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    navActive
                      ? 'text-[#535bad] bg-white'
                      : 'text-white hover:bg-white/10',
                    collapsed && 'justify-center px-2'
                  )
                }
              >
                <Icon className={cn('shrink-0', collapsed ? 'w-5 h-5' : 'w-4 h-4')} />
                {!collapsed && <span>{item.label}</span>}
                {(item as any).dot && !collapsed && (
                  <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <Separator className="opacity-20" />

      <button
        onClick={() => setShowAbout(true)}
        className={cn(
          'mb-8 border border-neutral-500/80 font-bold bg-white py-1 rounded-lg mt-2 hover:bg-gray-200 transition text-sm',
          collapsed ? 'mx-2 px-2' : 'mx-6 px-3'
        )}
      >
        {collapsed ? '?' : 'About Us'}
      </button>

      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden">
            <div className="bg-[#0f2344] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="https://ik.imagekit.io/qwzhnpeqg/delhi%20police/Screenshot_2026-06-10_194556-removebg-preview.png"
                  className="h-10 w-auto"
                  alt="Delhi Police"
                />
                <div>
                  <h2 className="text-white font-bold text-lg">Delhi <span className="text-[#c9a84c]">Police</span></h2>
                  <p className="text-blue-200/60 text-xs">Conference Hall Booking System</p>
                </div>
              </div>
              <button onClick={() => setShowAbout(false)} className="text-white/60 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                The <span className="font-semibold text-[#0f2344]">Delhi Police Conference Hall Booking System</span> is
                an official digital platform to streamline reservation and management of conference halls at PHQ, New Delhi.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Shield, label: 'Department', value: 'Delhi Police, PHQ' },
                  { icon: Building2, label: 'Location', value: 'ITO, New Delhi - 110002' },
                  { icon: Phone, label: 'Helpline', value: '011-23490000' },
                  { icon: Mail, label: 'Email', value: 'phq@delhipolice.gov.in' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="p-1.5 rounded-full border border-neutral-500/30 shrink-0">
                      <Icon className="w-3.5 h-3.5 text-[#0f2344]" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="text-xs font-semibold text-slate-700">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-[#0f2344]/5 border border-[#0f2344]/10">
                <p className="text-xs text-slate-500 text-center">
                  © {new Date().getFullYear()} Delhi Police · All rights reserved · Authorized personnel only
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
