import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap, tap } from 'rxjs/operators';
import { DiagramDataService } from "../../service/diagram-data.service"
import  * as fromNode from '../actions/node.actions'

@Injectable()
export class NodesEffects{
    constructor(private actions$: Actions,private nodeData:DiagramDataService){}

    loadNodes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromNode.loadNodes),
      mergeMap(() => this.nodeData.retrieveAllNodes()
        .pipe(
          map(nodes => fromNode.loadNodesSuccess({nodes:Object.values(nodes)}),
          catchError(() => of(fromNode.loadNodeFail)))
        )
      )
    )
  );
  saveNodes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromNode.saveNode),
      mergeMap((action) => this.nodeData.postNode(action.node)
        .pipe(
          map(() => fromNode.saveNodeSuccess(),
          catchError(() => of(fromNode.saveNodeFail())))
        )
      )
    )
  );
}