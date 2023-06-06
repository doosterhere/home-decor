import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { PersonalRoutingModule } from './personal-routing.module';
import { FavoritesComponent } from './favorites/favorites.component';
import { InfoComponent } from './info/info.component';
import { OrdersComponent } from './orders/orders.component';
import { SharedModule } from "../../shared/shared.module";

@NgModule( {
  declarations: [
    FavoritesComponent,
    InfoComponent,
    OrdersComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    PersonalRoutingModule
  ]
} )
export class PersonalModule {
}
