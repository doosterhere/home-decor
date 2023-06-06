import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Subscription } from "rxjs";

import { MatSnackBar } from "@angular/material/snack-bar";

import { ProductType } from "../../../../types/product.type";
import { environment } from "../../../../environments/environment";
import { CartService } from "../../services/cart.service";
import { CartType } from "../../../../types/cart.type";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { AuthService } from "../../../core/auth/auth.service";
import { FavoritesService } from "../../services/favorites.service";
import { FavoritesUtil } from "../../utils/favorites.util";
import { SnackbarErrorUtil } from "../../utils/snackbar-error.util";

@Component( {
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
} )
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product!: ProductType;
  @Input() isLight: boolean = false;
  @Input() countInCart: number = 0;
  serverStaticPath: string = environment.serverStaticPath;
  count: number = 1;
  @Input() isLogged: boolean = false;
  favoritesUtilUpdateFavoritesSubscription: Subscription | null = null;
  cartServiceUpdateCartSubscription: Subscription | null = null;

  constructor(private cartService: CartService,
              private _snackBar: MatSnackBar,
              private authService: AuthService,
              private favoriteService: FavoritesService,
              private router: Router) {
  }

  ngOnInit(): void {
    if (this.countInCart) {
      this.count = this.countInCart;
    }
  }

  ngOnDestroy(): void {
    this.favoritesUtilUpdateFavoritesSubscription?.unsubscribe();
    this.cartServiceUpdateCartSubscription?.unsubscribe();
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.countInCart) {
      this.addToCart();
    }
  }

  updateFavorites(): void {
    const subscription = FavoritesUtil.updateFavorites( this.authService, this.favoriteService, this.product, this._snackBar );
    if (subscription) {
      this.favoritesUtilUpdateFavoritesSubscription = subscription as Subscription;
    }
  }

  navigate(): void {
    if (this.isLight) {
      this.router.navigate( ['/product/' + this.product.url] );
    }
  }

  addToCart(): void {
    this.cartServiceUpdateCartSubscription = this.cartService.updateCart( this.product.id, this.count )
      .subscribe( (data: CartType | DefaultResponseType) => {
        SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError( data as DefaultResponseType, this._snackBar );
        this.countInCart = this.count;
      } );
  }

  removeFromCart(): void {
    this.cartServiceUpdateCartSubscription = this.cartService.updateCart( this.product.id, 0 )
      .subscribe( (data: CartType | DefaultResponseType) => {
        SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError( data as DefaultResponseType, this._snackBar );
        this.countInCart = 0;
        this.count = 1;
      } );
  }
}
