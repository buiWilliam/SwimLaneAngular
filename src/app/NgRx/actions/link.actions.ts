import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { ObjectData as Link } from 'gojs';

export const loadLinks = createAction(
  '[Link/API] Load Links'
);
export const loadLinksSuccess = createAction(
  '[Link/API] Load Links', 
  props<{ links: Link[] }>()
);
export const loadLinksFail = createAction(
  '[Link/API] Load Links'
);
export const updateLinkState = createAction(
  '[Link/API] Update Links State', 
  props<{ links: Link[] }>()
);

export const addLink = createAction(
  '[Link/API] Add Link',
  props<{ link: Link }>()
);

export const upsertLink = createAction(
  '[Link/API] Upsert Link',
  props<{ link: Link }>()
);

export const addLinks = createAction(
  '[Link/API] Add Links',
  props<{ links: Link[] }>()
);

export const upsertLinks = createAction(
  '[Link/API] Upsert Links',
  props<{ links: Link[] }>()
);

export const updateLink = createAction(
  '[Link/API] Update Link',
  props<{ link: Update<Link> }>()
);

export const updateLinks = createAction(
  '[Link/API] Update Links',
  props<{ links: Update<Link>[] }>()
);

export const deleteLink = createAction(
  '[Link/API] Delete Link',
  props<{ id: string }>()
);

export const deleteLinks = createAction(
  '[Link/API] Delete Links',
  props<{ ids: string[] }>()
);

export const clearLinks = createAction(
  '[Link/API] Clear Links'
);

export const selectLink = createAction(
  '[Link/API] Select Link',
  props<{selectedKey:number}>()
)
