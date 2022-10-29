import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { CommonState } from './common.reducer';

export const selectCommonFeature = createSelector(
  (state: AppState) => state.common,
  (common) => common
);

export const selectSidebarStatus = createSelector(
    selectCommonFeature,
    (state: CommonState) => {
        return state.isSidebarShown;
    }
)
