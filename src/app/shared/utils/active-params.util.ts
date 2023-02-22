import {ActiveParamsType} from "../../../types/active-params.type";
import {Params} from "@angular/router";

export class ActiveParamsUtil {
  static processParams(params: Params): ActiveParamsType {
    const activeParams: ActiveParamsType = {types: []};

    if (params.hasOwnProperty('types')) {
      activeParams.types = Array.isArray(params['types']) ? params['types'] : [params['types']];
    }

    if (params.hasOwnProperty('heightTo')) {
      activeParams.heightTo = Number(params['heightTo']);
    }

    if (params.hasOwnProperty('heightFrom')) {
      activeParams.heightFrom = Number(params['heightFrom']);
    }

    if (params.hasOwnProperty('diameterTo')) {
      activeParams.diameterTo = Number(params['diameterTo']);
    }

    if (params.hasOwnProperty('diameterFrom')) {
      activeParams.diameterFrom = Number(params['diameterFrom']);
    }

    if (params.hasOwnProperty('page')) {
      activeParams.page = Number(params['page']);
    }

    if (params.hasOwnProperty('sort')) {
      activeParams.sort = params['sort'];
    }

    return activeParams;
  }
}
