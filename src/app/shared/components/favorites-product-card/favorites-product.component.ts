import {Component, Input, OnInit} from '@angular/core';
import {FavoritesType} from "../../../../types/favorites.type";
import {environment} from "../../../../environments/environment";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoritesService} from "../../services/favorites.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../services/cart.service";

@Component({
  selector: 'favorites-product',
  templateUrl: './favorites-product.component.html',
  styleUrls: ['./favorites-product.component.scss']
})
export class FavoritesProductComponent implements OnInit {
  @Input() product!: FavoritesType;
  serverStaticPath: string = environment.serverStaticPath;
  @Input() countInCart: number = 0;
  count: number = 1;

  constructor(private favoriteService: FavoritesService,
              private _snackBar: MatSnackBar,
              private cartService: CartService) {
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error) {
        const message = (data as DefaultResponseType).message;
        this._snackBar.open(message);
        throw new Error(message);
      }

      const product = (data as CartType).items.find(item => item.product.id === this.product.id);
      if (product && product.quantity) {
        this.count = product.quantity;
        this.countInCart = this.count;
      }
    });
  }

  removeFromFavorites(): void {
    this.favoriteService.removeFromFavorites(this.product.id).subscribe((data: DefaultResponseType) => {
      if (data.error) {
        this._snackBar.open(data.message);
        throw new Error(data.message);
      }

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
    this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error) {
        const message = (data as DefaultResponseType).message;
        this._snackBar.open(message);
        throw new Error(message);
      }

      this.countInCart = this.count;
    });
  }

  removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0).subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error) {
        const message = (data as DefaultResponseType).message;
        this._snackBar.open(message);
        throw new Error(message);
      }

      this.countInCart = 0;
      this.count = 1;
    });
  }
}
