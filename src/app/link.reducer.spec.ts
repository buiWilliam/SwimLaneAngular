import { reducerLink, initialState } from './link.reducer';

describe('Link Reducer', () => {
  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducerLink(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
