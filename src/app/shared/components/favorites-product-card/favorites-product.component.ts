import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FavoritesType} from "../../../../types/favorites.type";
import {environment} from "../../../../environments/environment";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoritesService} from "../../services/favorites.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../services/cart.service";
import {SnackbarErrorUtil} from "../../utils/snackbar-error.util";
import {Subscription} from "rxjs";

@Component({
  selector: 'favorites-product',
  templateUrl: './favorites-product.component.html',
  styleUrls: ['./favorites-product.component.scss']
})
export class FavoritesProductComponent implements OnInit, OnDestroy {
  @Input() product!: FavoritesType;
  serverStaticPath: string = environment.serverStaticPath;
  @Input() countInCart: number = 0;
  count: number = 1;
  cartServiceGetCartSubscription: Subscription | null = null;
  favoriteServiceRemoveFromFavoritesSubscription: Subscription | null = null;
  cartServiceUpdateCartSubscription: Subscription | null = null;

  constructor(private favoriteService: FavoritesService,
              private _snackBar: MatSnackBar,
              private cartService: CartService) {
  }

  ngOnInit(): void {
    this.cartServiceGetCartSubscription = this.cartService.getCart().subscribe((data: CartType | DefaultResponseType) => {
      SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data as DefaultResponseType, this._snackBar);
      const product = (data as CartType).items.find(item => item.product.id === this.product.id);
      if (product && product.quantity) {
        this.count = product.quantity;
        this.countInCart = this.count;
      }
    });
  }

  ngOnDestroy(): void {
    this.cartServiceGetCartSubscription?.unsubscribe();
    this.favoriteServiceRemoveFromFavoritesSubscription?.unsubscribe();
    this.cartServiceUpdateCartSubscription?.unsubscribe();
  }

  removeFromFavorites(): void {
    this.favoriteServiceRemoveFromFavoritesSubscription = this.favoriteService.removeFromFavorites(this.product.id)
      .subscribe((data: DefaultResponseType) => {
        SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data, this._snackBar);
        this.favoriteService.isListOfFavoritesUpdated$.next(this.product.id);
        this._snackBar.open(data.message);
      });
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.countInCart) {
      this.addToCart();
    }
  }

  addToCart(): void {
    this.cartServiceUpdateCartSubscription = this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data as DefaultResponseType, this._snackBar);
        this.countInCart = this.count;
      });
  }

  removeFromCart(): void {
    this.cartServiceUpdateCartSubscription = this.cartService.updateCart(this.product.id, 0).subscribe((data: CartType | DefaultResponseType) => {
      SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data as DefaultResponseType, this._snackBar);
      this.countInCart = 0;
      this.count = 1;
    });
  }
}
