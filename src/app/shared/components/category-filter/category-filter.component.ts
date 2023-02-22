import {Component, Input, OnInit} from '@angular/core';
import {CategoryWithTypesType} from "../../../../types/category-with-types.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsType} from "../../../../types/active-params.type";
import {ActiveParamsUtil} from "../../utils/active-params.util";

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit {
  @Input() categoryWithTypes: CategoryWithTypesType | null = null;
  @Input() type: string | null = null;
  open: boolean = false;
  activeParams: ActiveParamsType = {types: []};
  to: number | null = null;
  from: number | null = null;

  constructor(private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.activeParams = ActiveParamsUtil.processParams(params);

      if (this.type) {
        if (this.type === 'height') {
          if (this.activeParams.heightFrom || this.activeParams.heightTo) {
            this.open = true
          }
          this.from = this.activeParams.heightFrom ? +this.activeParams.heightFrom : null;
          this.to = this.activeParams.heightTo ? +this.activeParams.heightTo : null;
        }

        if (this.type === 'diameter') {
          if (this.activeParams.diameterFrom || this.activeParams.diameterTo) {
            this.open = true;
          }
          this.from = this.activeParams.diameterFrom ? +this.activeParams.diameterFrom : null;
          this.to = this.activeParams.diameterTo ? +this.activeParams.diameterTo : null;
        }
      }

      if (!this.type && params['types']) {
        this.activeParams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];

        if (this.categoryWithTypes && this.categoryWithTypes.types &&
          this.categoryWithTypes.types.length &&
          this.categoryWithTypes.types.some(type => this.activeParams.types.find(item => type.url === item))) {
          this.open = true;
        }
      }
    });
  }

  get title(): string {
    if (this.categoryWithTypes) {
      return this.categoryWithTypes.name;
    }

    if (this.type && this.type === 'height') {
      return 'Высота';
    }

    if (this.type && this.type === 'diameter') {
      return 'Диаметр';
    }

    return '';
  }

  toggle(): void {
    this.open = !this.open;
  }

  updateFilterParam(url: string, checked: boolean): void {
    if (this.activeParams.types && this.activeParams.types?.length) {
      const existingTypeInParams: string | undefined = this.activeParams.types.find(item => item === url);

      if (existingTypeInParams && !checked) {
        this.activeParams.types = this.activeParams.types.filter(item => item !== url);
      }

      if (!existingTypeInParams && checked) {
        // this.activeParams.types.push(url);
        this.activeParams.types = [...this.activeParams.types, url];
      }
    }

    if (!this.activeParams.types?.length && checked) {
      this.activeParams.types = [url];
    }

    this.activeParams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }

  updateFilterParamFromTo(param: string, value: string): void {
    if (param === 'heightTo' || param === 'heightFrom' || param === 'diameterTo' || param === 'diameterFrom') {
      if (this.activeParams[param] && !value) {
        delete this.activeParams[param];
      } else {
        this.activeParams[param] = Number(value);
      }
    }

    this.activeParams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    });
  }
}
