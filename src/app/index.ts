import {
    createSelector,
    createFeatureSelector,
    ActionReducerMap,
  } from '@ngrx/store';
  import * as fromNode from './node.reducer';
  import * as fromLink from './link.reducer'
   
  export interface State {
    nodes: fromNode.State;
    links: fromLink.State;
  }
   
  export const reducers: ActionReducerMap<State> = {
    nodes: fromNode.reducerNode,
    links: fromLink.reducerLink,
  };
   
  export const selectNodeState = createFeatureSelector<fromNode.State>('nodes');

  export const selectLinkState = createFeatureSelector<fromLink.State>('links');
   
  export const selectNodeKey = createSelector(
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
  export const selectCount = createSelector(
    selectNodeState,
    fromNode.getNodeCount
  );
   
  // export const selectCurrentNode = createSelector(
  //   selectNodeEntities,
  //   selectCurrentNodeKey,
  //   (NodeEntities, NodeKey) => NodeEntities[NodeKey[]]
  // );

  export const selectLinkKey = createSelector(
    selectLinkState,
    fromLink.selectLinkKeys // shorthand for LinksState => fromLink.selectLinkIds(LinksState)
  );
  export const selectLinkEntities = createSelector(
    selectLinkState,
    fromLink.selectLinkEntities
  );
  export const selectAllLinks = createSelector(
    selectLinkState,
    fromLink.selectAllLinks
  );
  export const selectLinkTotal = createSelector(
    selectLinkState,
    fromLink.selectLinkTotal
  );
  export const selectCurrentLinkKey = createSelector(
    selectLinkState,
    fromLink.getSelectedLinkKey
  );
  export const selectCurrentLink = createSelector(
    selectLinkEntities,
    selectCurrentLinkKey,
    (LinkEntities, LinkKey) => LinkEntities[LinkKey]
  );