import {Component, OnInit} from '@angular/core';
import {CategoryService} from "../../services/category.service";
import {CategoryType} from "../../../../types/category.type";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
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
