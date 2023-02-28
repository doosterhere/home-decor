import {Component, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FavoritesType} from "../../../../types/favorites.type";
import {AuthService} from "../../../core/auth/auth.service";
import {FavoritesService} from "../../services/favorites.service";
import {Router} from "@angular/router";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: ProductType;
  @Input() isLight: boolean = false;
  @Input() countInCart: number = 0;
  serverStaticPath: string = environment.serverStaticPath;
  count: number = 1;

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

  addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count).subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error) {
        const message = (data as DefaultResponseType).message;
        this._snackBar.open((data as DefaultResponseType).message);
        throw new Error(message);
      }

      this.countInCart = this.count;
    });
  }

  removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0).subscribe((data: CartType | DefaultResponseType) => {
      if ((data as DefaultResponseType).error) {
        const message = (data as DefaultResponseType).message;
        this._snackBar.open((data as DefaultResponseType).message);
        throw new Error(message);
      }

      this.countInCart = 0;
      this.count = 1;
    });
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.countInCart) {
      this.addToCart();
    }
  }

  updateFavorites(): void {
    FavoritesService.updateFavorites(this.authService, this.favoriteService, this.product, this._snackBar);
  }

  navigate(): void {
    if (this.isLight) {
      this.router.navigate(['/product/' + this.product.url]);
    }
  }
}
