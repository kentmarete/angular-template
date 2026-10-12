import { Component, ElementRef, computed, effect, inject, signal } from '@angular/core';
import { filter, map, startWith } from 'rxjs';
import { Drawer } from './core/drawer';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

export interface NavItem { label: string; icon: string; path?: string; children?: { path: string; label: string; match?: RegExp }[]; }

@Component({
  imports: [Drawer, RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  host: { '(document:click)': 'onDocClick($event)', '(document:keydown.escape)': 'closeMenus()' },
  templateUrl: './app.html',
})
export class App {
  protected readonly dark = signal(this.initialDark());
  protected readonly menuOpen = signal(false);
  protected readonly profileOpen = signal(false);
  protected readonly notifOpen = signal(false);
  protected readonly drawerOpen = signal(false);
  protected readonly quick = signal({ compact: false, weekly: true, alerts: true });
  protected readonly notifications = signal([
    { id: 1, title: 'Payroll received', body: 'Acme Corp Payroll · $5,200.00', time: '2h ago', read: false },
    { id: 2, title: 'Payment pending', body: 'Power & Water · $132.75', time: '5h ago', read: false },
    { id: 3, title: 'Budget alert', body: 'Food spending is at 80% of budget', time: 'Yesterday', read: false },
    { id: 4, title: 'Invoice #204 paid', body: 'Freelance income of $840.00', time: '2 days ago', read: true },
  ]);
  protected readonly unread = computed(() => this.notifications().filter(n => !n.read).length);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly router = inject(Router);
  /** True on pages that render full-screen without the dashboard shell. */
  protected readonly bare = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url), startWith(location.pathname), map(u => this.isBare(u))),
    { initialValue: this.isBare(location.pathname) },
  );
  protected readonly collapsed = signal(this.read('sidebar') === '1');
  protected readonly nav: NavItem[] = [
    { path: '/overview', label: 'Overview', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
    { path: '/transactions', label: 'Transactions', icon: 'M4 6h16M4 12h16M4 18h10' },
    {
      label: 'Users', icon: 'M9 11a4 4 0 100-8 4 4 0 000 8zM2 21a7 7 0 0114 0M17 4a4 4 0 010 7M19 21a7 7 0 00-3-5.7',
      children: [
        { path: '/users', label: 'List', match: /^\/users$/ },
        { path: '/users/roles', label: 'Roles', match: /^\/users\/roles$/ },
        { path: '/users/permissions', label: 'Permissions', match: /^\/users\/permissions$/ },
        { path: '/users/1/edit', label: 'Edit user', match: /^\/users\/(\d+|new)\/edit$/ },
      ],
    },
    {
      label: 'Invoices', icon: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
      children: [
        { path: '/invoices', label: 'List', match: /^\/invoices$/ },
        { path: '/invoices/1', label: 'Preview', match: /^\/invoices\/\d+$/ },
        { path: '/invoices/1/edit', label: 'Edit', match: /^\/invoices\/(\d+|new)\/edit$/ },
      ],
    },
    { path: '/products', label: 'Products', icon: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8' },
    { path: '/chat', label: 'Chat', icon: 'M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z' },
    { path: '/tables', label: 'Data tables', icon: 'M3 5h18v14H3zM3 10h18M9 5v14' },
    { path: '/wizards', label: 'Wizards', icon: 'M5 12h4m6 0h4M9 12a3 3 0 106 0 3 3 0 00-6 0z' },
    { path: '/alerts', label: 'Alerts', icon: 'M12 8v5M12 16.5h.01M12 21a9 9 0 100-18 9 9 0 000 18z' },
    {
      label: 'User Interface', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
      children: [
        { path: '/buttons', label: 'Buttons' },
        { path: '/tooltips', label: 'Popovers' },
        { path: '/progress', label: 'Progress' },
        { path: '/tabs', label: 'Tabs' },
      ],
    },
    {
      label: 'Authentication', icon: 'M6 11h12v9H6zM9 11V8a3 3 0 016 0v3',
      children: [
        { path: '/login', label: 'Login' },
        { path: '/signup', label: 'Register' },
        { path: '/forgot-password', label: 'Forgot password' },
      ],
    },
    {
      label: 'Pages', icon: 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h3',
      children: [
        { path: '/', label: 'Landing page', match: /^\/$/ },
        { path: '/contact', label: 'Contact us' },
      ],
    },
    { path: '/forms', label: 'Form elements', icon: 'M5 3h14v18H5zM9 8h6M9 12h6M9 16h4' },
    { path: '/account', label: 'My account', icon: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0' },
  ];
  protected readonly openGroups = signal<ReadonlySet<string>>(new Set());

  protected readonly url = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(() => this.router.url), startWith(location.pathname)),
    { initialValue: location.pathname },
  );

  constructor() {
    this.apply();
    // keep the group that contains the current page expanded
    effect(() => {
      const u = this.url();
      const g = this.nav.find(n => n.children?.some(c => this.childActive(c, u)));
      if (g) this.openGroups.update(s => (s.has(g.label) ? s : new Set(s).add(g.label)));
    });
  }

  protected isOpen(n: NavItem) { return this.openGroups().has(n.label); }
  protected isGroupActive(n: NavItem) { return !!n.children?.some(c => this.childActive(c, this.url())); }
  protected childActive(c: { path: string; match?: RegExp }, url = this.url()) { const u = url.split(/[?#]/)[0]; return c.match ? c.match.test(u) : u.startsWith(c.path); }
  protected toggleGroup(n: NavItem) {
    // in the icon-only rail (desktop) expand the sidebar first so the sub-menu is visible
    if (this.collapsed() && matchMedia('(min-width: 861px)').matches) { this.toggleSidebar(); this.openGroups.update(s => new Set(s).add(n.label)); return; }
    this.openGroups.update(s => { const c = new Set(s); if (c.has(n.label)) c.delete(n.label); else c.add(n.label); return c; });
  }

  protected toggleTheme() {
    this.dark.update(d => !d); this.apply();
    try { localStorage.setItem('theme', this.dark() ? 'dark' : 'light'); } catch { /* storage unavailable */ }
  }
  protected onDocClick(e: Event) {
    const t = e.target as Node; const root: HTMLElement = this.host.nativeElement;
    if (!root.querySelector('.profile')?.contains(t)) this.profileOpen.set(false);
    if (!root.querySelector('.notif')?.contains(t)) this.notifOpen.set(false);
  }
  protected toggleQuick(key: 'compact' | 'weekly' | 'alerts') { this.quick.update(q => ({ ...q, [key]: !q[key] })); }
  private isBare(url: string) { const path = url.split(/[?#]/)[0];
    return path === '/' || ['/login', '/signup', '/forgot-password', '/contact'].some(p => path.startsWith(p)); }
  protected signOut() { this.closeMenus(); this.router.navigateByUrl('/login'); }
  protected closeMenus() { this.profileOpen.set(false); this.notifOpen.set(false); }
  protected toggleNotif() { this.notifOpen.update(o => !o); this.profileOpen.set(false); }
  protected toggleProfile() { this.profileOpen.update(o => !o); this.notifOpen.set(false); }
  protected markRead(id: number) { this.notifications.update(l => l.map(n => n.id === id ? { ...n, read: true } : n)); }
  protected markAllRead() { this.notifications.update(l => l.map(n => ({ ...n, read: true }))); }
  protected toggleSidebar() {
    this.collapsed.update(c => !c);
    try { localStorage.setItem('sidebar', this.collapsed() ? '1' : '0'); } catch { /* storage unavailable */ }
  }
  private read(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
  private apply() { document.documentElement.dataset['theme'] = this.dark() ? 'dark' : 'light'; }
  private initialDark() {
    try { const s = localStorage.getItem('theme'); if (s) return s === 'dark'; } catch { /* ignore */ }
    return matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
