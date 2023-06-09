import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { debounceTime, Subscription } from "rxjs";

import { MatSnackBar } from "@angular/material/snack-bar";

import { AuthService } from "../../../core/auth/auth.service";
import { CategoryWithTypesType } from "../../../../types/category-with-types.type";
import { CartService } from "../../services/cart.service";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { ProductService } from "../../services/product.service";
import { ProductType } from "../../../../types/product.type";
import { environment } from "../../../../environments/environment";

@Component( {
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
} )
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() categories: CategoryWithTypesType[] = [];
  isLogged: boolean = false;
  count: number = 0;
  searchField = new FormControl();
  searchResult: ProductType[] = [];
  serverStaticPath = environment.serverStaticPath;
  showedSearchResult: boolean = false;
  isMenuVisible: boolean = false;
  screenWidth: number = 0;
  searchFieldValueChangesSubscription: Subscription | null = null;
  productServiceSearchProductsSubscription: Subscription | null = null;
  authServiceIsLogged$Subscription: Subscription | null = null;
  cartServiceGetCartCountSubscription: Subscription | null = null;
  authServiceLogoutSubscription: Subscription | null = null;

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private cartService: CartService,
              private productService: ProductService) {
    this.isLogged = this.authService.isLogged;
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;

    this.searchFieldValueChangesSubscription = this.searchField.valueChanges
      .pipe( debounceTime( 500 ) )
      .subscribe( value => {
        if (value && value.length < 3) {
          this.searchResult = [];
        }

        if (value && value.length > 2) {
          this.productServiceSearchProductsSubscription = this.productService.searchProducts( value )
            .subscribe( (data: ProductType[]) => {
              this.searchResult = data;
              this.showedSearchResult = true;
            } );
        }
      } );

    this.authServiceIsLogged$Subscription = this.authService.isLogged$
      .subscribe( (isLogged: boolean) => {
        this.isLogged = isLogged;
      } );

    this.cartServiceGetCartCountSubscription = this.cartService.getCartCount()
      .subscribe( (data: { count: number } | DefaultResponseType) => {
        if (( data as DefaultResponseType ).error) {
          throw new Error( ( data as DefaultResponseType ).message );
        }

        this.count = ( data as { count: number } ).count;
      } );

    this.cartService.count$.subscribe( count => {
      this.count = count;
    } );
  }

  ngOnDestroy(): void {
    this.searchFieldValueChangesSubscription?.unsubscribe();
    this.productServiceSearchProductsSubscription?.unsubscribe();
    this.authServiceIsLogged$Subscription?.unsubscribe();
    this.cartServiceGetCartCountSubscription?.unsubscribe();
    this.authServiceLogoutSubscription?.unsubscribe();
  }

  logout(): void {
    this.authServiceLogoutSubscription = this.authService.logout()
      .subscribe( {
        next: () => {
          this.doLogout();
        },
        error: () => {
          this.doLogout();
        }
      } );
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open( 'Вы вышли из системы' );
    this.router.navigate( ['/'] );
  }

  foundProductClick(itemUrl: string): void {
    this.router.navigate( ['product/' + itemUrl] );
    this.searchField.setValue( '' );
    this.searchResult = [];
  }

  changeMenuVisibility(): void {
    if (this.screenWidth < 1024) {
      this.isMenuVisible = !this.isMenuVisible;

      if (this.isMenuVisible) {
        this.disableScroll();
        return;
      }

      this.enableScroll();
    }
  }

  disableScroll(): void {
    const scrollTop: number = document.documentElement.scrollTop;
    const scrollLeft: number = document.documentElement.scrollLeft;

    window.onscroll = function (): void {
      window.scrollTo( scrollLeft, scrollTop );
    }
  }

  enableScroll(): void {
    window.onscroll = function (): void {
    };
  }

  @HostListener( 'document:click', ['$event'] )
  click(event: Event): void {
    const target: HTMLElement = event.target as HTMLElement;

    this.showedSearchResult = target.hasAttribute( 'id' ) &&
      target.attributes.getNamedItem( 'id' )?.value === 'search-input';
  }

  @HostListener( 'window:resize', ['$event'] )
  onWindowResize() {
    this.screenWidth = window.innerWidth;
  }
}
