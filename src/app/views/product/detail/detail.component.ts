import {Component, OnDestroy, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {CartService} from "../../../shared/services/cart.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FavoritesService} from "../../../shared/services/favorites.service";
import {FavoritesType} from "../../../../types/favorites.type";
import {AuthService} from "../../../core/auth/auth.service";
import {FavoritesUtil} from "../../../shared/utils/favorites.util";
import {SnackbarErrorUtil} from "../../../shared/utils/snackbar-error.util";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit, OnDestroy {
  isLogged: boolean = false;
  recommendedProducts: ProductType[] = [];
  product!: ProductType;
  serverStaticPath: string = environment.serverStaticPath;
  count: number = 1;
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
  activatedRouteParamsSubscription: Subscription | null = null;
  productServiceGetProductSubscription: Subscription | null = null;
  cartServiceGetCartSubscription: Subscription | null = null;
  favoriteServiceGetFavoritesSubscription: Subscription | null = null;
  productServiceGetBestProductsSubscription: Subscription | null = null;
  cartServiceUpdateCartSubscription: Subscription | null = null;
  favoritesUtilUpdateFavoritesSubscription: Subscription | null = null;
  authServiceIsLogged$Subscription: Subscription | null = null;

  constructor(private productService: ProductService,
              private activatedRoute: ActivatedRoute,
              private cartService: CartService,
              private _snackBar: MatSnackBar,
              private favoriteService: FavoritesService,
              private authService: AuthService) {
    this.isLogged = this.authService.isLogged;
  }

  ngOnInit(): void {
    this.activatedRouteParamsSubscription = this.activatedRoute.params.subscribe(params => {
      this.productServiceGetProductSubscription = this.productService.getProduct(params['url'])
        .subscribe((data: ProductType) => {
          this.product = data;

          this.cartServiceGetCartSubscription = this.cartService.getCart()
            .subscribe((cartData: CartType | DefaultResponseType) => {
              SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(cartData as DefaultResponseType, this._snackBar);

              if (cartData) {
                const productInCart = (cartData as CartType).items.find(item => item.product.id === this.product.id);
                if (productInCart) {
                  this.product.countInCart = productInCart.quantity;
                  this.count = this.product.countInCart;
                }
              }
            });

          if (this.authService.isLogged) {
            this.favoriteServiceGetFavoritesSubscription = this.favoriteService.getFavorites()
              .subscribe((data: DefaultResponseType | FavoritesType[]) => {
                if ((data as DefaultResponseType).error) {
                  const message = (data as DefaultResponseType).message;
                  throw new Error(message);
                }

                const favorites: FavoritesType[] = data as FavoritesType[];
                if (favorites.find(item => item.id === this.product.id)) {
                  this.product.inFavorites = true;
                }
              });
          }

          if (!data) {
            //если в data пусто -> переход на 404
          }
        });
    });

    this.productServiceGetBestProductsSubscription = this.productService.getBestProducts()
      .subscribe((data: ProductType[]) => {
        if (data.length) {
          this.recommendedProducts = data;
        }
      });

    this.authServiceIsLogged$Subscription = this.authService.isLogged$
      .subscribe((isLogged: boolean) => {
        this.isLogged = isLogged;
      });
  }

  ngOnDestroy(): void {
    this.activatedRouteParamsSubscription?.unsubscribe();
    this.productServiceGetProductSubscription?.unsubscribe();
    this.cartServiceGetCartSubscription?.unsubscribe();
    this.favoriteServiceGetFavoritesSubscription?.unsubscribe();
    this.productServiceGetBestProductsSubscription?.unsubscribe();
    this.cartServiceUpdateCartSubscription?.unsubscribe();
    this.favoritesUtilUpdateFavoritesSubscription?.unsubscribe();
    this.authServiceIsLogged$Subscription?.unsubscribe();
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.product.countInCart) {
      this.addToCart();
    }
  }

  updateFavorites(): void {
    const subscription = FavoritesUtil.updateFavorites(this.authService, this.favoriteService, this.product, this._snackBar);
    if (subscription) {
      this.favoritesUtilUpdateFavoritesSubscription = subscription as Subscription;
    }
  }

  addToCart(): void {
    this.cartServiceUpdateCartSubscription = this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data as DefaultResponseType, this._snackBar);
        this.product.countInCart = this.count;
      });
  }

  removeFromCart(): void {
    this.cartServiceUpdateCartSubscription = this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError(data as DefaultResponseType, this._snackBar);
        this.product.countInCart = 0;
        this.count = 1;
      });
  }
}
