import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Common } from 'src/app/models/common/common';
import * as CommonActions from './common.actions';

export interface CommonState extends EntityState<Common> {
  isSidebarShown: boolean;
}

const adapter = createEntityAdapter<Common>();

const initialState: CommonState = adapter.getInitialState({
  isSidebarShown: false,
});

export const commonReducer = createReducer(
  initialState,
  on(CommonActions.toggleSidebar, (state, { sidebarStatus }) => ({
    ...state,
    isSidebarShown: sidebarStatus,
  }))
);
