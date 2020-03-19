import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap, tap } from 'rxjs/operators';
import { NodeDataService } from "../../service/node-data.service"
import  * as fromNode from '../actions/node.actions'

@Injectable()
export class NodesEffects{
    constructor(private actions$: Actions,private nodeData:NodeDataService){}

    loadNodes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromNode.loadNodes),
      mergeMap(() => this.nodeData.retrieveAllNodes()
        .pipe(
          map(nodes => fromNode.loadNodesSuccess({nodes:Object.values(nodes)}),
          catchError(() => fromNode.loadNodeFail))
        )
      )
    )
  );
}