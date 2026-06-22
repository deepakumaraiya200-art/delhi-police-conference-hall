import React, { useState } from 'react';
import { Bug, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api, setToken } from '@/services/api';
import { useUserStore } from '@/store/userStore';
import { useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';

const ACCOUNTS = [
  {
    group: 'Admin',
    color: 'bg-red-100 text-red-800',
    users: [
      { name: 'Rajesh Kumar', email: 'admin@delhipolice.gov.in', label: 'Admin' },
    ],
  },
  {
    group: 'Officers',
    color: 'bg-blue-100 text-blue-800',
    users: [
      { name: 'Sanjay Arora',    email: 'cp@delhipolice.gov.in',         label: 'CP' },
      { name: 'Deepak Yadav',    email: 'specialcp@delhipolice.gov.in',  label: 'Spl. CP' },
      { name: 'Priya Sharma',    email: 'jointcp@delhipolice.gov.in',    label: 'Jt. CP' },
      { name: 'Vikram Malhotra', email: 'addlcp@delhipolice.gov.in',     label: 'Addl. CP' },
      { name: 'Amit Singh',      email: 'dcp@delhipolice.gov.in',        label: 'DCP' },
      { name: 'Neha Patel',      email: 'acp@delhipolice.gov.in',        label: 'ACP' },
      { name: 'Rohit Mehta',     email: 'si@delhipolice.gov.in',         label: 'SI' },
      { name: 'Kavita Joshi',    email: 'user@delhipolice.gov.in',       label: 'Officer' },
    ],
  },
  {
    group: 'Caretakers',
    color: 'bg-emerald-100 text-emerald-800',
    users: [
      { name: 'Ramesh Gupta',   email: 'caretaker.aud@delhipolice.gov.in',  label: 'Auditorium' },
      { name: 'Meena Sharma',   email: 'caretaker.13@delhipolice.gov.in',   label: 'Room 13' },
      { name: 'Suresh Pal',     email: 'caretaker.107@delhipolice.gov.in',  label: 'Room 107' },
      { name: 'Geeta Devi',     email: 'caretaker.203@delhipolice.gov.in',  label: 'Room 203' },
      { name: 'Dinesh Kumar',   email: 'caretaker.307@delhipolice.gov.in',  label: 'Room 307' },
      { name: 'Pooja Singh',    email: 'caretaker.420@delhipolice.gov.in',  label: 'Room 420' },
      { name: 'Ashok Jain',     email: 'caretaker.1305@delhipolice.gov.in', label: 'Room 1305' },
      { name: 'Savita Rani',    email: 'caretaker.1400@delhipolice.gov.in', label: 'Room 1400' },
      { name: 'Vinod Sharma',   email: 'caretaker.1700@delhipolice.gov.in', label: '17th Floor' },
      { name: 'Kamla Devi',     email: 'caretaker.1429@delhipolice.gov.in', label: 'Room 1429' },
      { name: 'Manoj Yadav',    email: 'caretaker.124@delhipolice.gov.in',  label: 'Room 124' },
      { name: 'Anita Kumari',   email: 'caretaker.216@delhipolice.gov.in',  label: 'Room 216' },
      { name: 'Hemant Pandey',  email: 'caretaker.326@delhipolice.gov.in',  label: 'Room 326' },
      { name: 'Ritu Verma',     email: 'caretaker.727@delhipolice.gov.in',  label: 'Room 727' },
    ],
  },
];

export function DebugAccountSwitcher() {
  const [open, setOpen]           = useState(false);
  const [expanded, setExpanded]   = useState<string | null>('Officers');
  const [loading, setLoading]     = useState<string | null>(null);
  const { completeLogin, currentUser } = useUserStore();
  const queryClient = useQueryClient();

  const switchTo = async (email: string) => {
    if (loading) return;
    setLoading(email);
    try {
      const result = await api.post<{ token: string; user: User }>('/auth/debug-login', { email });
      setToken(result.token);
      completeLogin(result.user, result.token);
      queryClient.clear();
      window.location.href = '/';
    } catch (err) {
      console.error('Debug switch failed:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* Panel */}
      {open && (
        <div className="bg-white border border-neutral-200 rounded-xl shadow-2xl w-64 max-h-[70vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2.5 bg-neutral-900 rounded-t-xl">
            <div className="flex items-center gap-2">
              <Bug className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-white">Debug — Switch Account</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-white transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current */}
          {currentUser && (
            <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-100 text-xs text-neutral-500">
              Now: <span className="font-semibold text-neutral-800">{currentUser.name}</span>
              <span className="ml-1 text-neutral-400">({currentUser.role})</span>
            </div>
          )}

          {/* Groups */}
          <div className="overflow-y-auto flex-1">
            {ACCOUNTS.map((group) => (
              <div key={group.group}>
                <button
                  onClick={() => setExpanded(expanded === group.group ? null : group.group)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition"
                >
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', group.color)}>
                    {group.group}
                  </span>
                  {expanded === group.group
                    ? <ChevronDown className="w-3 h-3" />
                    : <ChevronRight className="w-3 h-3" />}
                </button>

                {expanded === group.group && (
                  <div className="pb-1">
                    {group.users.map((u) => {
                      const isActive = currentUser?.email === u.email;
                      const isLoading = loading === u.email;
                      return (
                        <button
                          key={u.email}
                          onClick={() => !isActive && switchTo(u.email)}
                          disabled={isActive || !!loading}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-1.5 text-left transition',
                            isActive
                              ? 'bg-blue-50 cursor-default'
                              : 'hover:bg-neutral-50 cursor-pointer',
                            loading && !isLoading && 'opacity-50'
                          )}
                        >
                          <div>
                            <p className={cn('text-xs font-medium', isActive ? 'text-blue-700' : 'text-neutral-800')}>
                              {u.name}
                            </p>
                            <p className="text-[10px] text-neutral-400">{u.label}</p>
                          </div>
                          {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
                          {isActive && <span className="text-[9px] font-bold text-blue-500 uppercase">Active</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg text-xs font-bold transition-all',
          open
            ? 'bg-neutral-900 text-white'
            : 'bg-amber-400 text-neutral-900 hover:bg-amber-500'
        )}
      >
        <Bug className="w-3.5 h-3.5" />
        {open ? 'Close' : 'Switch Account'}
      </button>
    </div>
  );
}
