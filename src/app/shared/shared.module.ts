import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";

import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

import { PasswordRepeatDirective } from "./directives/password-repeat.directive";
import { ProductCardComponent } from './components/product-card/product-card.component';
import { CategoryFilterComponent } from './components/category-filter/category-filter.component';
import { CountSelectorComponent } from './components/count-selector/count-selector.component';
import { LoaderComponent } from './components/loader/loader.component';
import { FavoritesProductComponent } from './components/favorites-product/favorites-product.component';

@NgModule( {
  declarations: [
    PasswordRepeatDirective,
    ProductCardComponent,
    CategoryFilterComponent,
    CountSelectorComponent,
    LoaderComponent,
    FavoritesProductComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  exports: [
    PasswordRepeatDirective,
    ProductCardComponent,
    CategoryFilterComponent,
    CountSelectorComponent,
    LoaderComponent,
    FavoritesProductComponent
  ]
} )
export class SharedModule {
}
