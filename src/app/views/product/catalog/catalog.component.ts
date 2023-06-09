import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { debounceTime, Subscription } from "rxjs";

import { MatSnackBar } from "@angular/material/snack-bar";

import { ProductType } from "../../../../types/product.type";
import { ProductService } from "../../../shared/services/product.service";
import { CategoryService } from "../../../shared/services/category.service";
import { CategoryWithTypesType } from "../../../../types/category-with-types.type";
import { ActiveParamsType } from "../../../../types/active-params.type";
import { ActiveParamsUtil } from "../../../shared/utils/active-params.util";
import { AppliedFilterType } from "../../../../types/applied-filter.type";
import { CartType } from "../../../../types/cart.type";
import { CartService } from "../../../shared/services/cart.service";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { FavoritesService } from "../../../shared/services/favorites.service";
import { FavoritesType } from "../../../../types/favorites.type";
import { AuthService } from "../../../core/auth/auth.service";
import { SnackbarErrorUtil } from "../../../shared/utils/snackbar-error.util";

@Component( {
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
} )
export class CatalogComponent implements OnInit, OnDestroy {
  products: ProductType[] = [];
  favoriteProducts: FavoritesType[] | null = null;
  requestSuccess: boolean = false;
  categoriesWithTypes: CategoryWithTypesType[] = [];
  activeParams: ActiveParamsType = { types: [] };
  appliedFilters: AppliedFilterType[] = [];
  sortingOpen: boolean = false;
  sortingOptions: { name: string, value: string }[] = [
    { name: 'От А до Я', value: 'az-asc' },
    { name: 'От Я до А', value: 'az-desc' },
    { name: 'По возрастанию цены', value: 'price-asc' },
    { name: 'По убыванию цены', value: 'price-desc' },
  ];
  pages: number[] = [];
  cart: CartType | null = null;
  isLogged: boolean = false;
  cartServiceGetCartSubscription: Subscription | null = null;
  favoritesServiceGetFavoritesSubscription: Subscription | null = null;
  authServiceIsLogged$Subscription: Subscription | null = null;
  categoryServiceGetCategoriesWithTypesSubscription: Subscription | null = null;
  activatedRouteQueryParamsSubscription: Subscription | null = null;
  productServiceGetProductsSubscription: Subscription | null = null;

  constructor(private productService: ProductService,
              private categoryService: CategoryService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private cartService: CartService,
              private _snackBar: MatSnackBar,
              private favoritesService: FavoritesService,
              private authService: AuthService) {
    this.isLogged = this.authService.isLogged;
  }

  ngOnInit(): void {
    this.cartServiceGetCartSubscription = this.cartService.getCart()
      .subscribe( (data: CartType | DefaultResponseType) => {
        SnackbarErrorUtil.showErrorMessageIfErrorAndThrowError( data as DefaultResponseType, this._snackBar );
        this.cart = data as CartType;

        if (this.authService.isLogged) {
          this.favoritesServiceGetFavoritesSubscription = this.favoritesService.getFavorites()
            .subscribe( {
              next: (data: FavoritesType[] | DefaultResponseType) => {
                if (( data as DefaultResponseType ).error) {
                  const message = ( data as DefaultResponseType ).message;
                  this.processCatalog();
                  throw new Error( message );
                }

                this.favoriteProducts = data as FavoritesType[];
                this.processCatalog();
              },
              error: (error) => {
                this.processCatalog();
              },
            } );
        }

        if (!this.authService.isLogged) {
          this.processCatalog();
        }
      } );

    this.authServiceIsLogged$Subscription = this.authService.isLogged$
      .subscribe( (isLogged: boolean) => {
        this.isLogged = isLogged;
      } );
  }

  ngOnDestroy(): void {
    this.cartServiceGetCartSubscription?.unsubscribe();
    this.favoritesServiceGetFavoritesSubscription?.unsubscribe();
    this.authServiceIsLogged$Subscription?.unsubscribe();
    this.categoryServiceGetCategoriesWithTypesSubscription?.unsubscribe();
    this.activatedRouteQueryParamsSubscription?.unsubscribe();
    this.productServiceGetProductsSubscription?.unsubscribe();
  }

  processCatalog(): void {
    this.categoryServiceGetCategoriesWithTypesSubscription = this.categoryService.getCategoriesWithTypes()
      .subscribe( data => {
        this.categoriesWithTypes = data;

        this.activatedRouteQueryParamsSubscription = this.activatedRoute.queryParams
          .pipe(
            debounceTime( 500 )
          )
          .subscribe( params => {
            this.activeParams = ActiveParamsUtil.processParams( params );

            this.appliedFilters = [];

            this.activeParams.types.forEach( url => {
              for (let i = 0; i < this.categoriesWithTypes.length; i++) {
                const foundType = this.categoriesWithTypes[i].types.find( type => type.url === url );

                if (foundType) {
                  this.appliedFilters.push( {
                    name: foundType.name,
                    urlParam: foundType.url
                  } );
                }
              }
            } );

            if (this.activeParams.heightFrom) {
              this.appliedFilters.push( {
                name: 'Высота: от ' + this.activeParams.heightFrom + ' см',
                urlParam: 'heightFrom'
              } );
            }

            if (this.activeParams.heightTo) {
              this.appliedFilters.push( {
                name: 'Высота: до ' + this.activeParams.heightTo + ' см',
                urlParam: 'heightTo'
              } );
            }

            if (this.activeParams.diameterFrom) {
              this.appliedFilters.push( {
                name: 'Диаметр: от ' + this.activeParams.diameterFrom + ' см',
                urlParam: 'diameterFrom'
              } );
            }

            if (this.activeParams.diameterTo) {
              this.appliedFilters.push( {
                name: 'Диаметр: до ' + this.activeParams.diameterTo + ' см',
                urlParam: 'diameterTo'
              } );
            }

            this.productServiceGetProductsSubscription = this.productService.getProducts( this.activeParams )
              .subscribe( {
                next: (data) => {
                  this.pages = [];
                  for (let i = 1; i <= data.pages; i++) {
                    this.pages.push( i );
                  }
                  this.requestSuccess = true;

                  if (this.cart && this.cart.items.length > 0) {
                    this.products = data.items.map( product => {
                      if (this.cart) {
                        const productInCart = this.cart.items.find( item => item.product.id === product.id );
                        if (productInCart) {
                          product.countInCart = productInCart.quantity;
                        }
                      }

                      return product;
                    } );
                  }

                  if (!this.cart || this.cart.items.length === 0) {
                    this.products = data.items;
                  }

                  if (this.favoriteProducts) {
                    this.products = this.products.map( product => {
                      if (this.favoriteProducts?.find( item => item.id === product.id )) {
                        product.inFavorites = true;
                      }

                      return product;
                    } )
                  }

                },
                error: (error) => {
                  this.requestSuccess = false;
                  throw new Error( error.message );
                }
              } );
          } );
      } );
  }

  removeAppliedFilter(appliedFilter: AppliedFilterType): void {
    if (appliedFilter.urlParam === 'heightFrom' || appliedFilter.urlParam === 'heightTo' ||
      appliedFilter.urlParam === 'diameterFrom' || appliedFilter.urlParam === 'diameterTo') {
      delete this.activeParams[appliedFilter.urlParam];
    } else {
      this.activeParams.types = this.activeParams.types.filter( item => item !== appliedFilter.urlParam );
    }

    this.activeParams.page = 1;
    this.router.navigate( ['catalog'], {
      queryParams: this.activeParams
    } );
  }

  toggleSorting(): void {
    this.sortingOpen = !this.sortingOpen;
  }

  sort(value: string): void {
    this.activeParams.sort = value;
    this.router.navigate( ['catalog'], {
      queryParams: this.activeParams
    } )
  }

  openPage(page: number): void {
    this.activeParams.page = page;
    this.router.navigate( ['catalog'], {
      queryParams: this.activeParams
    } );
  }

  openPreviousPage(): void {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this.router.navigate( ['catalog'], {
        queryParams: this.activeParams
      } );
    }
  }

  openNextPage(): void {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this.router.navigate( ['catalog'], {
        queryParams: this.activeParams
      } );
    }
  }
}
