import { AnyAction, applyMiddleware, createStore, Store } from 'redux';
import type {
  PromiseAssignEffect,
  PromiseEffect,
} from '../model/enhanceEffect';
import { metaInterceptor } from '../middleware/metaInterceptor';
import { isMetaAction, MetaStateItem } from '../actions/meta';
import { freezeState } from '../utils/freezeState';
import { getImmer } from '../utils/getImmer';
import { actionRefresh, isRefreshAction } from '../actions/refresh';
import { combine } from './emptyStore';

export interface FindMeta {
  find(category: number | string): Partial<MetaStateItem>;
}

export interface FindLoading {
  find(category: number | string): boolean;
}

interface MetaState extends FindMeta {
  data: {
    [category: string]: MetaStateItem;
  };
}

interface LoadingState extends FindLoading {
  data: {
    [category: string]: boolean;
  };
}

interface MetaStoreStateItem {
  metas: MetaState;
  loadings: LoadingState;
}

export type MetaStoreState = {
  [model_method: string]: MetaStoreStateItem;
};

const undeclaredMeta = freezeState({});

const findMeta: FindMeta['find'] = function (this: MetaState, category) {
  return this.data[category] || undeclaredMeta;
};

const findLoading: FindLoading['find'] = function (
  this: LoadingState,
  category,
) {
  return !!this.data[category];
};

const createDefaultRecord = (): MetaStoreStateItem => {
  return {
    metas: {
      find: findMeta,
      data: {},
    },
    loadings: {
      find: findLoading,
      data: {},
    },
  };
};

const defaultRecord = freezeState(createDefaultRecord());

const helper = {
  status: <Record<string, boolean>>{},

  get(effect: PromiseEffect | PromiseAssignEffect): MetaStoreStateItem {
    const {
      _: { model, method },
    } = effect;
    let record: MetaStoreStateItem | undefined;
    const combineKey = this.keyOf(model, method);

    if (this.isActive(combineKey)) {
      record = metaStore.getState()[combineKey];
    } else {
      this.activate(combineKey);
    }

    return record || defaultRecord;
  },

  isActive(key: string): boolean {
    return this.status[key] === true;
  },
  activate(key: string) {
    this.status[key] = true;
  },
  inactivate(key: string) {
    this.status[key] = false;
  },

  refresh() {
    return metaStore.dispatch(actionRefresh(true));
  },

  keyOf(model: string, method: string) {
    return model + '.' + method;
  },
};

const immer = getImmer();

export const metaStore = createStore(
  (state: MetaStoreState = {}, action: AnyAction): MetaStoreState => {
    if (isMetaAction(action)) {
      const { model, method, payload, category } = action;
      const combineKey = helper.keyOf(model, method);
      const next = immer.produce(state, (draft) => {
        const { metas, loadings } = (draft[combineKey] ||=
          createDefaultRecord());

        metas.data[category] = payload;
        loadings.data[category] = payload.type === 'pending';
      });

      freezeState(next[combineKey]!.metas);
      freezeState(next[combineKey]!.loadings);
      return next;
    }

    if (isRefreshAction(action)) {
      return {};
    }

    return state;
  },
  applyMiddleware(metaInterceptor(helper)),
) as Store<MetaStoreState> & { helper: typeof helper };

combine(metaStore);

metaStore.helper = helper;
