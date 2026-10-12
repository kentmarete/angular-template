import { Routes } from '@angular/router';
import { Overview } from './pages/overview';
import { Account } from './pages/account';
import { Tables } from './pages/tables';
import { Chat } from './pages/chat';
import { Login } from './pages/login';
import { Signup } from './pages/signup';
import { Wizards } from './pages/wizards';
import { Alerts } from './pages/alerts';
import { TabsPills } from './pages/tabs-pills';
import { Buttons } from './pages/buttons';
import { Progress } from './pages/progress';
import { Tooltips } from './pages/tooltips';
import { ForgotPassword } from './pages/forgot-password';
import { Products } from './pages/products';
import { ProductDetail } from './pages/product-detail';
import { Invoices } from './pages/invoices';
import { InvoicePreview } from './pages/invoice-preview';
import { InvoiceEdit } from './pages/invoice-edit';
import { Users } from './pages/users';
import { Permissions } from './pages/permissions';
import { UserEdit } from './pages/user-edit';
import { Roles } from './pages/roles';
import { Landing } from './pages/landing';
import { Contact } from './pages/contact';
import { Forms } from './pages/forms';
import { Transactions } from './pages/transactions';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Landing, title: 'Fin — Manage your finances with clarity' },
  { path: 'contact', component: Contact, title: 'Contact us · Fin' },
  { path: 'overview', component: Overview, title: 'Overview · Fin' },
  { path: 'transactions', component: Transactions, title: 'Transactions · Fin' },
  { path: 'forms', component: Forms, title: 'Form elements · Fin' },
  { path: 'account', component: Account, title: 'My account · Fin' },
  { path: 'tables', component: Tables, title: 'Data tables · Fin' },
  { path: 'chat', component: Chat, title: 'Chat · Fin' },
  { path: 'login', component: Login, title: 'Sign in · Fin' },
  { path: 'signup', component: Signup, title: 'Sign up · Fin' },
  { path: 'wizards', component: Wizards, title: 'Wizards · Fin' },
  { path: 'alerts', component: Alerts, title: 'Alerts · Fin' },
  { path: 'tabs', component: TabsPills, title: 'Tabs & pills · Fin' },
  { path: 'buttons', component: Buttons, title: 'Buttons · Fin' },
  { path: 'progress', component: Progress, title: 'Progress & spinners · Fin' },
  { path: 'tooltips', component: Tooltips, title: 'Tooltips & popovers · Fin' },
  { path: 'forgot-password', component: ForgotPassword, title: 'Forgot password · Fin' },
  { path: 'products', component: Products, title: 'Products · Fin' },
  { path: 'products/:id', component: ProductDetail, title: 'Product · Fin' },
  { path: 'invoices', component: Invoices, title: 'Invoices · Fin' },
  { path: 'invoices/:id/edit', component: InvoiceEdit, title: 'Edit invoice · Fin' },
  { path: 'invoices/:id', component: InvoicePreview, title: 'Invoice · Fin' },
  { path: 'users', component: Users, title: 'Users · Fin' },
  { path: 'users/roles', component: Roles, title: 'Roles · Fin' },
  { path: 'users/permissions', component: Permissions, title: 'Permissions · Fin' },
  { path: 'users/:id/edit', component: UserEdit, title: 'Edit user · Fin' },
  { path: '**', redirectTo: 'overview' },
];
