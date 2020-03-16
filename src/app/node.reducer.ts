import { Action, createReducer, on, createSelector } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Node } from './node.model';
import * as NodeActions from './node.actions';

export const nodesFeatureKey = 'nodes';

export interface State extends EntityState<Node> {
  // additional entities state properties
  selectedNode:string
}

export const adapter: EntityAdapter<Node> = createEntityAdapter<Node>(
  {
    selectId: node =>node.key
  }
  
);

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  selectedNode: ""
});

const nodeReducer = createReducer(
  initialState,
  on(NodeActions.addNode,
    (state, action) => adapter.addOne(action.node, state)
  ),
  on(NodeActions.upsertNode,
    (state, action) => adapter.upsertOne(action.node, state)
  ),
  on(NodeActions.addNodes,
    (state, action) => adapter.addMany(action.nodes, state)
  ),
  on(NodeActions.upsertNodes,
    (state, action) => adapter.upsertMany(action.nodes, state)
  ),
  on(NodeActions.updateNode,
    (state, action) => adapter.updateOne(action.node, state)
  ),
  on(NodeActions.updateNodes,
    (state, action) => adapter.updateMany(action.nodes, state)
  ),
  on(NodeActions.deleteNode,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(NodeActions.deleteNodes,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(NodeActions.loadNodes,
    (state, action) => adapter.setAll(action.nodes, state)
  ),
  on(NodeActions.clearNodes,
    state => adapter.removeAll(state)
  ),
  on(NodeActions.selectNode, (state, { selectedKey }) => {
    return { ...state, selectedNode: selectedKey };
  }),
);

export function reducer(state: State | undefined, action: Action) {
  return nodeReducer(state, action);
}

export const getSelectedNodeKey = (state: State) => state.selectedNode;

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

// select the array of Node ids
export const selectNodeKeys = selectIds;
 
// select the dictionary of Node entities
export const selectNodeEntities = selectEntities;
 
// select the array of Nodes
export const selectAllNodes = selectAll;
 
// select the total Node count
export const selectNodeTotal = selectTotal;