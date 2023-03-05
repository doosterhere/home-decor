import {Component, OnDestroy, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";
import {environment} from "../../../../environments/environment";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CartUtil} from "../../../shared/utils/cart.util";
import {SnackbarErrorUtil} from "../../../shared/utils/snackbar-error.util";
import {Subscription} from "rxjs";

@Component({
  selector: 'cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  extraProducts: ProductType[] = [];
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    margin: 25,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }
  cart: CartType | null = null;
  serverStaticPath = environment.serverStaticPath;
  totalAmount: number = 0;
  totalCount: number = 0;
  productServiceGetBestProductsSubscription: Subscription | null = null;
  cartServiceGetCartSubscription: Subscription | null = null;
  cartServiceUpdateCartSubscription: Subscription | null = null;

  constructor(private productService: ProductService,
              private cartService: CartService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.productServiceGetBestProductsSubscription = this.productService.getBestProducts()
      .subscribe((data: ProductType[]) => {
        this.extraProducts = data;
      });

    this.cartServiceGetCartSubscription = this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.cart = data as CartType;
        [this.totalAmount, this.totalCount] = CartUtil.calculateTotal(this.cart);
      });
  }

  ngOnDestroy(): void {
    this.productServiceGetBestProductsSubscription?.unsubscribe();
    this.cartServiceGetCartSubscription?.unsubscribe();
    this.cartServiceUpdateCartSubscription?.unsubscribe();
  }

  updateCount(productId: string, count: number): void {
    if (this.cart) {
      this.cartServiceUpdateCartSubscription = this.cartService.updateCart(productId, count)
        .subscribe((data: CartType | DefaultResponseType) => {
          SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data as DefaultResponseType, this._snackBar);
          this.cart = data as CartType;
          [this.totalAmount, this.totalCount] = CartUtil.calculateTotal(this.cart);
        });
    }
  }
}
