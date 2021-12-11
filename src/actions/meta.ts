import { Action, AnyAction } from 'redux';

export interface Meta {
  message?: string;
}

export type MetaType = 'pending' | 'resolved' | 'rejected';

export const META_DEFAULT_CATEGORY = '##' + Math.random();

export interface MetaStateItem extends Meta {
  type?: MetaType;
}

export interface MetaAction extends Action<string> {
  setMeta: true;
  model: string;
  method: string;
  payload: MetaStateItem;
  category: string | number;
}

export const isMetaAction = (action: AnyAction): action is MetaAction => {
  const test = action as MetaAction;
  return (
    test.setMeta === true && !!test.model && !!test.method && !!test.category
  );
};
