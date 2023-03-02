import {Component, HostListener, Input, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {CategoryWithTypesType} from "../../../../types/category-with-types.type";
import {CartService} from "../../services/cart.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ProductService} from "../../services/product.service";
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {FormControl} from "@angular/forms";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() categories: CategoryWithTypesType[] = [];
  isLogged: boolean = false;
  count: number = 0;
  searchField = new FormControl();
  searchResult: ProductType[] = [];
  serverStaticPath = environment.serverStaticPath;
  showedSearchResult: boolean = false;

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private cartService: CartService,
              private productService: ProductService) {
    this.isLogged = this.authService.isLogged;
  }

  ngOnInit(): void {
    this.searchField.valueChanges
      .pipe(debounceTime(500))
      .subscribe(value => {
        if (value && value.length < 3) {
          this.searchResult = [];
        }

        if (value && value.length > 2) {
          this.productService.searchProducts(value).subscribe((data: ProductType[]) => {
            this.searchResult = data;
            this.showedSearchResult = true;
          });
        }
      });

    this.authService.isLogged$.subscribe((isLogged: boolean) => {
      this.isLogged = isLogged;
    });

    this.cartService.getCartCount().subscribe((data: { count: number } | DefaultResponseType) => {
      if ((data as DefaultResponseType).error) {
        throw new Error((data as DefaultResponseType).message);
      }

      this.count = (data as { count: number }).count;
    });

    this.cartService.count$.subscribe(count => {
      this.count = count;
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.doLogout();
      },
      error: () => {
        this.doLogout();
      }
    });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this.router.navigate(['/']);
  }

  foundProductClick(itemUrl: string): void {
    this.router.navigate(['product/' + itemUrl]);
    this.searchField.setValue('');
    this.searchResult = [];
  }

  @HostListener('document:click', ['$event'])
  click(event: Event): void {
    this.showedSearchResult = !(this.showedSearchResult && (event.target as HTMLElement).className.indexOf('search-result') === -1);
  }
}
