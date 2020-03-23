import { Action, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Link } from '../link.model';
import * as LinkActions from '../actions/link.actions';

export const linksFeatureKey = 'links';

export interface State extends EntityState<Link> {
  // additional entities state properties
  selectedLinkKey:number
}

export const adapter: EntityAdapter<Link> = createEntityAdapter<Link>({
  selectId: link => link.key
});

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  selectedLinkKey:null
});

const linkReducer = createReducer(
  initialState,
  on(LinkActions.addLink,
    (state, action) => adapter.addOne(action.link, state)
  ),
  on(LinkActions.upsertLink,
    (state, action) => adapter.upsertOne(action.link, state)
  ),
  on(LinkActions.addLinks,
    (state, action) => adapter.addMany(action.links, state)
  ),
  on(LinkActions.upsertLinks,
    (state, action) => adapter.upsertMany(action.links, state)
  ),
  on(LinkActions.updateLink,
    (state, action) => adapter.updateOne(action.link, state)
  ),
  on(LinkActions.updateLinks,
    (state, action) => adapter.updateMany(action.links, state)
  ),
  on(LinkActions.deleteLink,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(LinkActions.deleteLinks,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(LinkActions.updateLinkState,
    (state, action) => adapter.setAll(action.links, state)
  ),
  on(LinkActions.clearLinks,
    state => adapter.removeAll(state)
  ),
  on(LinkActions.selectLink, (state, { selectedKey }) => {
    return { ...state, selectedLinkKey: selectedKey };
  }),
  on(LinkActions.loadLinks
  ),
  on(LinkActions.loadLinksSuccess,
    (state, action) => adapter.setAll(action.links, state)
  ),
);

export function reducerLink(state: State | undefined, action: Action) {
  return linkReducer(state, action);
}

export const getSelectedLinkKey = (state: State) => state.selectedLinkKey;

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = adapter.getSelectors();

// select the array of Link ids
export const selectLinkKeys = selectIds;
 
// select the dictionary of Link entities
export const selectLinkEntities = selectEntities;
 
// select the array of Links
export const selectAllLinks = selectAll;
 
// select the total Link count
export const selectLinkTotal = selectTotal;