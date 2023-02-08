import {Component, OnInit} from '@angular/core';
import {CategoryType} from "../../../types/category.type";
import {CategoryService} from "../services/category.service";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {
  categories: CategoryType[] = [];

  constructor(private categoryService: CategoryService) {
  }

  ngOnInit(): void {
    this.categoryService.getCategories()
      .subscribe({
        next: (data: CategoryType[]) => {
          if (data) {
            this.categories = data;
          }
        },
        error: (error) => {
          throw new Error(error.message);
        }
      })
  }

}
