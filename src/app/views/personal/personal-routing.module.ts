import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FavoritesComponent} from "./favorites/favorites.component";
import {OrdersComponent} from "./orders/orders.component";
import {InfoComponent} from "./info/info.component";

const routes: Routes = [
  {path: 'favorites', component: FavoritesComponent},
  {path: 'orders', component: OrdersComponent},
  {path: 'profile', component: InfoComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonalRoutingModule {
}
