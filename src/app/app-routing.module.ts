import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SwimLaneComponent } from './swim-lane/swim-lane.component';


const routes: Routes = [
  {path:"",component:LandingPageComponent},
  {path:"swimLane",component:SwimLaneComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
