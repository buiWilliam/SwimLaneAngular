import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { ObjectData as Node } from 'gojs';

export const loadNodes = createAction(
  '[Node/API] Load Nodes'
);
export const loadNodesSuccess = createAction(
  '[Node/API] Nodes Load Success', 
  props<{ nodes: Node[] }>()
);
export const updateNodeState = createAction(
  '[Node/API] State Updated', 
  props<{ nodes: Node[] }>()
);
export const loadNodeFail = createAction(
  '[Node/API] Nodes Load Failure'
);
export const saveNode = createAction(
  '[Node/API] Save Nodes', 
  props<{ node: Node}>()
);
export const saveNodeSuccess = createAction(
  '[Node/API] Nodes Save Success', 
);
export const saveNodeFail = createAction(
  '[Node/API] Nodes Save Failure'
);
export const addNode = createAction(
  '[Node/API] Add Node',
  props<{ node: Node }>()
);

export const upsertNode = createAction(
  '[Node/API] Upsert Node',
  props<{ node: Node }>()
);

export const addNodes = createAction(
  '[Node/API] Add Nodes',
  props<{ nodes: Node[] }>()
);

export const upsertNodes = createAction(
  '[Node/API] Upsert Nodes',
  props<{ nodes: Node[] }>()
);

export const updateNode = createAction(
  '[Node/API] Update Node',
  props<{ node: Update<Node> }>()
);

export const updateNodes = createAction(
  '[Node/API] Update Nodes',
  props<{ nodes: Update<Node>[] }>()
);

export const deleteNode = createAction(
  '[Node/API] Delete Node',
  props<{ id: string }>()
);

export const deleteNodes = createAction(
  '[Node/API] Delete Nodes',
  props<{ ids: string[] }>()
);

export const clearNodes = createAction(
  '[Node/API] Clear Nodes'
);

export const selectNodes = createAction(
  '[Node/API] Select Node',
  props<{selectedKeys:Array<string>}>()
)

export const increment = createAction('[Node/API] Increment');
export const decrement = createAction('[Node/API] Decrement');

