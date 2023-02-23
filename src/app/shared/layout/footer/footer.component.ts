import {Component, Input, OnInit} from '@angular/core';
import {CategoryWithTypesType} from "../../../../types/category-with-types.type";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  @Input() categories: CategoryWithTypesType[] = [];

  constructor() {

  }

  ngOnInit(): void {
  }
}
