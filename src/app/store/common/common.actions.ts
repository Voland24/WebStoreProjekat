import { createAction, props } from '@ngrx/store';

export const toggleSidebar = createAction(
  '[Common] Toggle Sidebar',
  props<{ sidebarStatus: boolean }>()
);
