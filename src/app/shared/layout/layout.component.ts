import {Component, OnInit} from '@angular/core';
import {CategoryType} from "../../../types/category.type";
import {CategoryService} from "../services/category.service";
import {CategoryWithTypesType} from "../../../types/category-with-types.type";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {
  categories: CategoryWithTypesType[] = [];

  constructor(private categoryService: CategoryService) {
  }

  ngOnInit(): void {
    this.categoryService.getCategoriesWithTypes()
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

}
