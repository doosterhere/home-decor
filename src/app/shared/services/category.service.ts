import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {TypeType} from "../../../types/type.type";
import {CategoryWithTypesType} from "../../../types/category-with-types.type";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private httpClient: HttpClient) {
  }

  // getCategories(): Observable<CategoryType[]> {
  //   return this.httpClient.get<CategoryType[]>(environment.api + 'categories');
  // }

  getCategoriesWithTypes(): Observable<CategoryWithTypesType[]> {
    return this.httpClient.get<TypeType[]>(environment.api + 'types')
      .pipe(
        map((items: TypeType[]) => {
          const array: CategoryWithTypesType[] = [];

          items.forEach((item: TypeType) => {
            const foundItem = array.find(arrayItem => arrayItem.url === item.category.url);

            if (foundItem) {
              foundItem.types.push(
                {
                  id: item.id,
                  name: item.name,
                  url: item.url
                }
              );
            }

            if (!foundItem) {
              array.push({
                id: item.category.id,
                name: item.category.name,
                url: item.category.url,
                types: [
                  {
                    id: item.id,
                    name: item.name,
                    url: item.url
                  }
                ]
              });
            }
          });

          return array;
        })
      );
  }
}

