import {
    createSelector,
    createFeatureSelector,
    ActionReducerMap,
  } from '@ngrx/store';
  import * as fromNode from './node.reducer';
   
  export interface State {
    nodes: fromNode.State;
  }
   
  export const reducers: ActionReducerMap<State> = {
    nodes: fromNode.reducer,
  };
   
  export const selectNodeState = createFeatureSelector<fromNode.State>('nodes');
   
  export const selectKey = createSelector(
    selectNodeState,
    fromNode.selectNodeKeys // shorthand for NodesState => fromNode.selectNodeIds(NodesState)
  );
  export const selectNodeEntities = createSelector(
    selectNodeState,
    fromNode.selectNodeEntities
  );
  export const selectAllNodes = createSelector(
    selectNodeState,
    fromNode.selectAllNodes
  );
  export const selectNodeTotal = createSelector(
    selectNodeState,
    fromNode.selectNodeTotal
  );
  export const selectCurrentNodeKey = createSelector(
    selectNodeState,
    fromNode.getSelectedNodeKey
  );
   
  export const selectCurrentNode = createSelector(
    selectNodeEntities,
    selectCurrentNodeKey,
    (NodeEntities, NodeKey) => NodeEntities[NodeKey]
  );