import {Component, OnDestroy, OnInit} from '@angular/core';
import {CategoryService} from "../services/category.service";
import {CategoryWithTypesType} from "../../../types/category-with-types.type";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit, OnDestroy {
  categories: CategoryWithTypesType[] = [];
  categoryServiceGetCategoriesWithTypesSubscription: Subscription | null = null;

  constructor(private categoryService: CategoryService) {
  }

  ngOnInit(): void {
    this.categoryServiceGetCategoriesWithTypesSubscription = this.categoryService.getCategoriesWithTypes()
      .subscribe({
        next: (categories: CategoryWithTypesType[]) => {
          if (categories) {
            this.categories = categories.map(category => {
              return Object.assign({typesUrl: category.types.map(type => type.url)}, category);
            });
          }
        },
        error: (error) => {
          throw new Error(error.message);
        }
      })
  }

  ngOnDestroy(): void {
    this.categoryServiceGetCategoriesWithTypesSubscription?.unsubscribe();
  }

}
