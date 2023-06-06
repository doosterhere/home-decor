import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";

import { MatDialogModule } from "@angular/material/dialog";
import { CarouselModule } from "ngx-owl-carousel-o";

import { OrderRoutingModule } from './order-routing.module';
import { CartComponent } from './cart/cart.component';
import { OrderComponent } from './order/order.component';
import { SharedModule } from "../../shared/shared.module";

@NgModule( {
  declarations: [
    CartComponent,
    OrderComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CarouselModule,
    ReactiveFormsModule,
    MatDialogModule,
    OrderRoutingModule
  ]
} )
export class OrderModule {
}
