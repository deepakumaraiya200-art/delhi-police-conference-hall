import React, { useState, useMemo } from 'react';
import {
  UserPlus, Trash2, Search, Shield, ShieldCheck, UserCog, Users,
  Eye, EyeOff, X, ChevronDown, BadgeCheck, Crown, Star, Mail, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { useUsersManagementStore } from '@/store/usersManagementStore';
import { users as staticUsers } from '@/data/users';
import { getRankLabel } from '@/types';
import type { User, UserRole, LoginType } from '@/types';
import { cn } from '@/lib/utils';

const ROLE_OPTIONS: { value: UserRole; label: string; loginType: LoginType }[] = [
  { value: 'admin',         label: 'Admin',                     loginType: 'admin' },
  { value: 'caretaker',     label: 'Caretaker',                 loginType: 'caretaker' },
  { value: 'cp',            label: 'CP – Commissioner',         loginType: 'officer' },
  { value: 'special_cp',    label: 'Special CP',                loginType: 'officer' },
  { value: 'joint_cp',      label: 'Joint CP',                  loginType: 'officer' },
  { value: 'additional_cp', label: 'Addl. CP',                  loginType: 'officer' },
  { value: 'dcp',           label: 'DCP – Deputy Commissioner', loginType: 'officer' },
  { value: 'acp',           label: 'ACP – Asst. Commissioner',  loginType: 'officer' },
  { value: 'si',            label: 'SI – Sub Inspector',        loginType: 'officer' },
  { value: 'user',          label: 'User (Officer)',             loginType: 'officer' },
];

function roleIcon(role: UserRole) {
  if (role === 'admin') return <ShieldCheck className="w-3 h-3 text-red-600" />;
  if (role === 'caretaker') return <UserCog className="w-3 h-3 text-emerald-600" />;
  if (role === 'cp') return <Crown className="w-3 h-3 text-red-800" />;
  if (role === 'special_cp') return <Star className="w-3 h-3 text-purple-600" />;
  return <Shield className="w-3 h-3 text-blue-600" />;
}

function roleBadgeClass(role: UserRole): string {
  if (role === 'admin') return 'bg-red-100 text-red-700 border-red-200';
  if (role === 'caretaker') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (role === 'cp') return 'bg-red-50 text-red-800 border-red-200';
  if (role === 'special_cp') return 'bg-purple-100 text-purple-700 border-purple-200';
  if (role === 'joint_cp') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (role === 'additional_cp') return 'bg-sky-100 text-sky-700 border-sky-200';
  if (role === 'dcp') return 'bg-teal-100 text-teal-700 border-teal-200';
  if (role === 'acp') return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  if (role === 'si') return 'bg-slate-100 text-slate-700 border-slate-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

const EMPTY_FORM = {
  name: '', email: '', password: '', department: '',
  role: 'user' as UserRole, demoEmail: '', assignedRooms: '',
};

export default function AdminUsers() {
  const { extraUsers, demoEmailOverrides, addUser, deleteUser, setDemoEmail } = useUsersManagementStore();
  const [search, setSearch] = useState('');
  const [filterPortal, setFilterPortal] = useState<'all' | LoginType>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [formErr, setFormErr] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  // Edit demoEmail dialog
  const [editEmailUser, setEditEmailUser] = useState<User | null>(null);
  const [editEmailValue, setEditEmailValue] = useState('');

  const allUsers: User[] = useMemo(() => {
    // Merge static users with demoEmail overrides
    const withOverrides = staticUsers.map((u) =>
      demoEmailOverrides[u.id] ? { ...u, demoEmail: demoEmailOverrides[u.id] } : u
    );
    return [...withOverrides, ...extraUsers];
  }, [extraUsers, demoEmailOverrides]);

  const filtered = allUsers.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchPortal = filterPortal === 'all' || u.loginType === filterPortal;
    return matchSearch && matchPortal;
  });

  function validate() {
    const errs: typeof formErr = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    else if (allUsers.some((u) => u.email.toLowerCase() === form.email.toLowerCase())) errs.email = 'Email already exists';
    if (!form.password.trim()) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (!form.department.trim()) errs.department = 'Department is required';
    return errs;
  }

  function handleAdd() {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErr(errs); return; }
    const roleDef = ROLE_OPTIONS.find((r) => r.value === form.role)!;
    const newUser: User = {
      id: `u-dyn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
      department: form.department.trim(),
      role: form.role,
      loginType: roleDef.loginType,
      avatar: form.name.trim().split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2),
      demoEmail: form.demoEmail.trim() || undefined,
      assignedRooms: form.assignedRooms.trim()
        ? form.assignedRooms.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };
    addUser(newUser);
    toast.success(`User "${newUser.name}" created`);
    setShowAdd(false);
    setForm(EMPTY_FORM);
    setFormErr({});
  }

  function handleDelete(user: User) {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    deleteUser(user.id);
    toast.success(`User "${user.name}" deleted`);
  }

  function openEditEmail(user: User) {
    setEditEmailUser(user);
    setEditEmailValue(user.demoEmail ?? '');
  }

  function saveEditEmail() {
    if (!editEmailUser) return;
    const isDynamic = extraUsers.some((u) => u.id === editEmailUser.id);
    if (isDynamic) {
      // Update dynamic user directly
      useUsersManagementStore.getState().updateUser(editEmailUser.id, { demoEmail: editEmailValue.trim() || undefined });
    } else {
      // Store override for static user
      setDemoEmail(editEmailUser.id, editEmailValue.trim());
    }
    toast.success('Demo email updated');
    setEditEmailUser(null);
  }

  const counts = {
    total:     allUsers.length,
    admin:     allUsers.filter((u) => u.loginType === 'admin').length,
    caretaker: allUsers.filter((u) => u.loginType === 'caretaker').length,
    officer:   allUsers.filter((u) => u.loginType === 'officer').length,
  };

  return (
    <div className="space-y-6 p-6">
      <PageHeader title="Manage Users" description="View, create, and manage all system users">
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A237E] text-white rounded-lg text-sm font-semibold hover:bg-[#151c6b] transition"
        >
          <UserPlus className="w-4 h-4" /> Add User
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: counts.total,     icon: Users,      bg: 'bg-blue-50',    color: 'text-[#1A237E]' },
          { label: 'Admins',      value: counts.admin,     icon: ShieldCheck, bg: 'bg-red-50',     color: 'text-red-700'  },
          { label: 'Caretakers',  value: counts.caretaker, icon: UserCog,    bg: 'bg-emerald-50', color: 'text-emerald-700' },
          { label: 'Officers',    value: counts.officer,   icon: BadgeCheck, bg: 'bg-amber-50',   color: 'text-amber-700' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4 flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', bg)}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{value}</p>
              <p className="text-xs text-neutral-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#1A237E] transition"
          />
        </div>
        <div className="relative">
          <select
            value={filterPortal}
            onChange={(e) => setFilterPortal(e.target.value as any)}
            className="appearance-none pl-3 pr-8 py-2 border border-neutral-200 rounded-lg text-sm outline-none focus:border-[#1A237E] bg-white"
          >
            <option value="all">All portals</option>
            <option value="admin">Admin</option>
            <option value="caretaker">Caretaker</option>
            <option value="officer">Officer</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-48">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-52">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-24">Portal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-36">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-32">Department</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Demo Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-400 text-sm">No users found.</td>
                </tr>
              )}
              {filtered.map((user) => {
                const isDynamic = extraUsers.some((e) => e.id === user.id);
                return (
                  <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#1A237E]/10 flex items-center justify-center text-[10px] font-bold text-[#1A237E] shrink-0">
                          {(user.avatar || user.name).slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-neutral-800 text-xs truncate max-w-[130px]">{user.name}</p>
                          {isDynamic && <span className="text-[9px] text-emerald-600 font-medium">● Dynamic</span>}
                        </div>
                      </div>
                    </td>
                    {/* Email */}
                    <td className="px-4 py-3">
                      <p className="font-mono text-[11px] text-neutral-600 truncate max-w-[190px]" title={user.email}>{user.email}</p>
                    </td>
                    {/* Portal */}
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize', roleBadgeClass(user.role))}>
                        {roleIcon(user.loginType === 'admin' ? 'admin' : user.loginType === 'caretaker' ? 'caretaker' : user.role)}
                        {user.loginType}
                      </span>
                    </td>
                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap', roleBadgeClass(user.role))}>
                        {roleIcon(user.role)}
                        {getRankLabel(user.role)}
                      </span>
                    </td>
                    {/* Department */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-neutral-600 truncate max-w-[120px]" title={user.department}>{user.department}</p>
                    </td>
                    {/* Demo Email */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {user.demoEmail ? (
                          <p className="font-mono text-[11px] text-blue-600 truncate max-w-[180px]" title={user.demoEmail}>{user.demoEmail}</p>
                        ) : (
                          <span className="text-neutral-300 text-xs">—</span>
                        )}
                        <button
                          onClick={() => openEditEmail(user)}
                          className="shrink-0 text-neutral-400 hover:text-[#1A237E] transition"
                          title="Edit demo email"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      {isDynamic ? (
                        <button
                          onClick={() => handleDelete(user)}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 transition font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-300">Static</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-neutral-50 text-xs text-neutral-400">
          Showing {filtered.length} of {allUsers.length} users
        </div>
      </div>

      {/* ── Edit Demo Email Modal ──────────────────────────────────────────── */}
      {editEmailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[400px] max-w-full overflow-hidden">
            <div className="bg-[#0f2344] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#c9a84c]" />
                <p className="text-white font-semibold text-sm">Edit Demo Email</p>
              </div>
              <button onClick={() => setEditEmailUser(null)} className="text-white/60 hover:text-white transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-neutral-700">{editEmailUser.name}</p>
                <p className="font-mono text-[11px] text-neutral-500 mt-0.5">{editEmailUser.email}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-600">Yopmail Demo Address</label>
                <input
                  type="email"
                  placeholder="e.g. dp.officer.name@yopmail.com"
                  value={editEmailValue}
                  onChange={(e) => setEditEmailValue(e.target.value)}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1A237E] transition"
                  autoFocus
                />
                <p className="text-[10px] text-neutral-400">OTP will be sent to this address. Check it at yopmail.com (no signup needed).</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditEmailUser(null)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditEmail}
                  className="flex-1 px-4 py-2 bg-[#1A237E] text-white rounded-lg text-sm font-semibold hover:bg-[#151c6b] transition"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ────────────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-w-full overflow-hidden">
            <div className="bg-[#0f2344] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-[#c9a84c]" />
                <h2 className="text-white font-semibold text-base">Create New User</h2>
              </div>
              <button onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormErr({}); }}
                className="text-white/60 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-neutral-600">Full Name *</label>
                  <input type="text" placeholder="e.g. Rajesh Kumar" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none transition',
                      formErr.name ? 'border-red-400' : 'border-neutral-200 focus:border-[#1A237E]')} />
                  {formErr.name && <p className="text-xs text-red-500">{formErr.name}</p>}
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-neutral-600">Login Email *</label>
                  <input type="email" placeholder="e.g. officer@delhipolice.gov.in" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none transition',
                      formErr.email ? 'border-red-400' : 'border-neutral-200 focus:border-[#1A237E]')} />
                  {formErr.email && <p className="text-xs text-red-500">{formErr.email}</p>}
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-neutral-600">Password *</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={cn('w-full border rounded-lg px-3 py-2 pr-10 text-sm outline-none transition',
                        formErr.password ? 'border-red-400' : 'border-neutral-200 focus:border-[#1A237E]')} />
                    <button type="button" onClick={() => setShowPwd((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErr.password && <p className="text-xs text-red-500">{formErr.password}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Role *</label>
                  <div className="relative">
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                      className="appearance-none w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1A237E] bg-white">
                      {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Portal: <span className="font-semibold">{ROLE_OPTIONS.find((r) => r.value === form.role)?.loginType}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-600">Department *</label>
                  <input type="text" placeholder="e.g. Traffic, HRD" value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className={cn('w-full border rounded-lg px-3 py-2 text-sm outline-none transition',
                      formErr.department ? 'border-red-400' : 'border-neutral-200 focus:border-[#1A237E]')} />
                  {formErr.department && <p className="text-xs text-red-500">{formErr.department}</p>}
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-semibold text-neutral-600">Yopmail Demo Email</label>
                  <input type="email" placeholder="e.g. dp.officer.name@yopmail.com" value={form.demoEmail}
                    onChange={(e) => setForm({ ...form, demoEmail: e.target.value })}
                    className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1A237E] transition" />
                  <p className="text-[10px] text-neutral-400">OTP goes here — accessible at yopmail.com without signup</p>
                </div>

                {form.role === 'caretaker' && (
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs font-semibold text-neutral-600">Assigned Room IDs</label>
                    <input type="text" placeholder="e.g. room-1, room-3" value={form.assignedRooms}
                      onChange={(e) => setForm({ ...form, assignedRooms: e.target.value })}
                      className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1A237E] transition" />
                    <p className="text-[10px] text-neutral-400">Comma-separated room IDs</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowAdd(false); setForm(EMPTY_FORM); setFormErr({}); }}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition">
                  Cancel
                </button>
                <button onClick={handleAdd}
                  className="flex-1 px-4 py-2 bg-[#1A237E] text-white rounded-lg text-sm font-semibold hover:bg-[#151c6b] transition flex items-center justify-center gap-2">
                  <UserPlus className="w-4 h-4" /> Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
