import { Routes } from '@angular/router';
import { TemplateComponent } from './core/template/container/template.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DemandHistoryComponent } from './features/demand-history/demand-history.component';
import { TaskComponent } from './features/task/task.component';

import { LandingComponent } from './features/landing/landing.component';
import { LoginComponent } from './features/login/login.component';
import { RolesPermissionsComponent } from './features/roles-permissions/roles-permissions.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: TemplateComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'demand-history', component: DemandHistoryComponent },
      { path: 'tasks', component: TaskComponent },
      {
        path: 'role-permission',
        component: RolesPermissionsComponent,
        canActivate: [authGuard],
      },
    ],
  },

  { path: '**', redirectTo: 'landing' },
];
