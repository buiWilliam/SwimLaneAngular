import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError} from 'rxjs/operators';
import { DiagramDataService } from "../../service/diagram-data.service"
import  * as fromLink from '../actions/link.actions'

@Injectable()
export class LinksEffects{
    constructor(private actions$: Actions,private linkData:DiagramDataService){}

//     loadLinks$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(fromLink.loadLinks),
//       mergeMap(() => this.linkData.retrieveAllLinks()
//         .pipe(
//           map(links => fromLink.loadLinksSuccess({links:Object.values(links)}),
//           catchError(() => of(fromLink.loadLinkFail)))
//         )
//       )
//     )
//   );
//   saveLinks$ = createEffect(() =>
//     this.actions$.pipe(
//       ofType(fromLink.saveLink),
//       mergeMap((action) => this.linkData.postLink(action.link)
//         .pipe(
//           map(() => fromLink.saveLinkSuccess(),
//           catchError(() => of(fromLink.saveLinkFail())))
//         )
//       )
//     )
//   );
}