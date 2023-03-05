import {Component, Input} from '@angular/core';
import {CategoryWithTypesType} from "../../../../types/category-with-types.type";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input() categories: CategoryWithTypesType[] = [];

  constructor() {

  }
}
