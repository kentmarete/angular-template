import { Injectable, computed, signal } from '@angular/core';

export type Role = string;
export type UserStatus = 'Active' | 'Invited' | 'Suspended';
export const BUILT_IN_ROLES: Role[] = ['Admin', 'Manager', 'Editor', 'Viewer'];
export const USER_STATUSES: UserStatus[] = ['Active', 'Invited', 'Suspended'];

export interface Module { key: string; label: string; actions: { key: string; label: string }[]; }
const act = (...a: string[]) => a.map(k => ({ key: k, label: k[0].toUpperCase() + k.slice(1) }));
export const MODULES: Module[] = [
  { key: 'invoices', label: 'Invoices', actions: act('view', 'create', 'edit', 'delete') },
  { key: 'products', label: 'Products', actions: act('view', 'create', 'edit', 'delete') },
  { key: 'users', label: 'Users', actions: act('view', 'invite', 'edit', 'delete') },
  { key: 'reports', label: 'Reports', actions: act('view', 'export') },
  { key: 'settings', label: 'Settings', actions: act('view', 'manage') },
];
export const permKey = (m: Module, a: { key: string }) => `${m.key}.${a.key}`;
export const ALL_PERMS = MODULES.flatMap(m => m.actions.map(a => permKey(m, a)));

export interface User { id: number; name: string; email: string; role: Role; status: UserStatus; lastActive: string; permissions: string[]; }

const defaults = (): Record<string, string[]> => ({
  Admin: [...ALL_PERMS],
  Manager: ALL_PERMS.filter(p => !['users.delete', 'settings.manage'].includes(p)),
  Editor: ALL_PERMS.filter(p => /\.(view|create|edit)$/.test(p) && !p.startsWith('users.') && !p.startsWith('settings.')),
  Viewer: ALL_PERMS.filter(p => p.endsWith('.view') && p !== 'settings.view'),
});

@Injectable({ providedIn: 'root' })
export class UserService {
  /** Default permission set granted by each role. Editable on the Permissions page. */
  readonly roleTemplates = signal<Record<string, string[]>>(defaults());
  readonly roleDescriptions = signal<Record<string, string>>({
    Admin: 'Full access to everything, including managing users and settings.',
    Manager: 'Runs day-to-day operations. Can manage content and invite users.',
    Editor: 'Creates and edits invoices and products. No user management.',
    Viewer: 'Read-only access to most areas.',
  });
  readonly roleNames = computed(() => Object.keys(this.roleTemplates()));
  isBuiltIn(role: Role) { return BUILT_IN_ROLES.includes(role); }
  userCount(role: Role) { return this.users().filter(u => u.role === role).length; }

  /** Create a role, or (when `original` is given) update/rename it. Returns an error message, or null on success. */
  saveRole(original: Role | null, name: Role, description: string, perms: string[]): string | null {
    name = name.trim();
    if (!name) return 'Role name is required.';
    if (name !== original && this.roleTemplates()[name]) return `A role named "${name}" already exists.`;
    if (original === 'Admin') return 'Admin is built in and can\'t be edited.';
    this.roleTemplates.update(t => {
      const n = { ...t }; if (original && original !== name) delete n[original]; n[name] = ALL_PERMS.filter(p => perms.includes(p)); return n;
    });
    this.roleDescriptions.update(d => { const n = { ...d }; if (original && original !== name) delete n[original]; n[name] = description.trim(); return n; });
    if (original && original !== name) this.users.update(l => l.map(u => (u.role === original ? { ...u, role: name } : u)));
    return null;
  }
  removeRole(role: Role) {
    if (this.isBuiltIn(role) || this.userCount(role)) return;
    this.roleTemplates.update(t => { const n = { ...t }; delete n[role]; return n; });
    this.roleDescriptions.update(d => { const n = { ...d }; delete n[role]; return n; });
  }

  readonly users = signal<User[]>([
    { id: 1, name: 'Kenneth Marete', email: 'kenneth@example.com', role: 'Admin', status: 'Active', lastActive: 'Just now', permissions: [...ALL_PERMS] },
    { id: 2, name: 'Amina Otieno', email: 'amina.otieno@example.com', role: 'Manager', status: 'Active', lastActive: '12 min ago', permissions: defaults()['Manager'] },
    { id: 3, name: 'Brian Mutua', email: 'brian.mutua@example.com', role: 'Editor', status: 'Active', lastActive: '2 hours ago', permissions: [...defaults()['Editor'], 'reports.export'] },
    { id: 4, name: 'Chloe Wanjiru', email: 'chloe.wanjiru@example.com', role: 'Editor', status: 'Active', lastActive: 'Yesterday', permissions: defaults()['Editor'] },
    { id: 5, name: 'David Kamau', email: 'david.kamau@example.com', role: 'Viewer', status: 'Invited', lastActive: '—', permissions: defaults()['Viewer'] },
    { id: 6, name: 'Esther Kariuki', email: 'esther.kariuki@example.com', role: 'Viewer', status: 'Active', lastActive: '3 days ago', permissions: defaults()['Viewer'] },
    { id: 7, name: 'Farid Abdi', email: 'farid.abdi@example.com', role: 'Manager', status: 'Suspended', lastActive: '2 weeks ago', permissions: defaults()['Manager'] },
  ]);

  get(id: number) { return this.users().find(u => u.id === id); }
  blank(): User {
    const id = Math.max(0, ...this.users().map(u => u.id)) + 1;
    return { id, name: '', email: '', role: 'Viewer', status: 'Invited', lastActive: '—', permissions: [...this.roleTemplates()['Viewer']] };
  }
  save(u: User) { this.users.update(l => (l.some(x => x.id === u.id) ? l.map(x => (x.id === u.id ? u : x)) : [...l, u])); }
  remove(id: number) { this.users.update(l => l.filter(u => u.id !== id)); }

  setRolePerm(role: Role, perm: string, on: boolean) {
    if (role === 'Admin') return; // Admin always has everything
    this.roleTemplates.update(t => ({ ...t, [role]: on ? [...new Set([...t[role], perm])] : t[role].filter(p => p !== perm) }));
  }
  /** True when the user's permissions differ from their role's template. */
  isCustom(u: Pick<User, 'role' | 'permissions'>) {
    const t = this.roleTemplates()[u.role] ?? [];
    return t.length !== u.permissions.length || t.some(p => !u.permissions.includes(p));
  }
}
