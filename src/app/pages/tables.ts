import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActionsTable } from './tables/actions-table';
import { InlineTable } from './tables/inline-table';
import { PagedTable } from './tables/paged-table';

@Component({
  selector: 'app-tables',
  imports: [ActionsTable, InlineTable, PagedTable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-actions-table /><app-inline-table /><app-paged-table />`,
  styles: `:host { display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; }`,
})
export class Tables {}
