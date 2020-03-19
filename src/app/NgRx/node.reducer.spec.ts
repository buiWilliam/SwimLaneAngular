import { reducerNode, initialState } from './node.reducer';

describe('Node Reducer', () => {
  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducerNode(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
