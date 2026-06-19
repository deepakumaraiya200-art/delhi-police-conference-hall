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
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const [showAbout, setShowAbout] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-neutral-500/30 bg-[#535bad] transition-all duration-300 ease-in-out flex flex-col',
          collapsed ? 'w-[68px]' : 'w-[260px]'
        )}
      >
        {/* Logo Section */}
        <div className={cn(' items-center h-30 px-1  border-b border-neutral-500/80', collapsed ? 'justify-center' : 'gap-3')}>
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


              return link;
            })}
          </div>
        </nav>

        <Separator />

        <button
          onClick={() => setShowAbout(true)}
          className='mb-10 border border-neutral-500/80 font-bold bg-white py-1 px-3 ml-10 mr-10 rounded-lg mt-2 hover:bg-gray-200'
        >
          {collapsed ? '?' : 'About Us'}
        </button>

        {/* About Modal */}
        {showAbout && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl shadow-2xl w-[480px] max-w-[90vw] overflow-hidden'>
              <div className='bg-[#0f2344] px-6 py-5 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <img
                    src='https://ik.imagekit.io/qwzhnpeqg/delhi%20police/Screenshot_2026-06-10_194556-removebg-preview.png'
                    className='h-10 w-auto'
                    alt='Delhi Police'
                  />
                  <div>
                    <h2 className='text-white font-bold text-lg leading-tight'>Delhi <span className='text-[#c9a84c]'>Police</span></h2>
                    <p className='text-blue-200/60 text-xs'>Conference Hall Booking System</p>
                  </div>
                </div>
                <button onClick={() => setShowAbout(false)} className='text-white/60 hover:text-white transition'>
                  <X className='w-5 h-5' />
                </button>
              </div>
              <div className='px-6 py-5 space-y-4'>
                <p className='text-sm text-slate-600 leading-relaxed'>
                  The <span className='font-semibold text-[#0f2344]'>Delhi Police Conference Hall Booking System</span> is an official digital platform developed to streamline the reservation and management of conference halls and meeting rooms at Police Headquarters (PHQ), New Delhi.
                </p>
                <div className='grid grid-cols-2 gap-3'>
                  {[
                    { icon: Shield, label: 'Department', value: 'Delhi Police, PHQ' },
                    { icon: Building2, label: 'Location', value: 'ITO, New Delhi - 110002' },
                    { icon: Phone, label: 'Helpline', value: '011-23490000' },
                    { icon: Mail, label: 'Email', value: 'phq@delhipolice.gov.in' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className='flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100'>
                      <div className='p-1.5 rounded-full border border-neutral-500/30 shrink-0'>
                        <Icon className='w-3.5 h-3.5 text-[#0f2344]' />
                      </div>
                      <div>
                        <p className='text-xs text-slate-400'>{label}</p>
                        <p className='text-xs font-semibold text-slate-700'>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className='p-3 rounded-xl bg-[#0f2344]/5 border border-[#0f2344]/10'>
                  <p className='text-xs text-slate-500 text-center'>
                    © {new Date().getFullYear()} Delhi Police · All rights reserved · Authorized personnel only
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}
