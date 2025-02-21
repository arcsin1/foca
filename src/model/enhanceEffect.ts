import {
  LoadingAction,
  LOADING_CATEGORY,
  TYPE_SET_LOADING,
} from '../actions/loading';
import type { EffectCtx } from './types';
import { isPromise } from '../utils/isPromise';
import { toArgs } from '../utils/toArgs';
import { loadingStore } from '../store/loadingStore';

interface RoomFunc<P extends any[] = any[], R = Promise<any>> {
  (category: number | string): {
    execute(...args: P): R;
  };
}

interface AsyncRoomEffect<P extends any[] = any[], R = Promise<any>>
  extends RoomFunc<P, R> {
  readonly _: {
    readonly model: string;
    readonly method: string;
    readonly hasRoom: true;
  };
}

interface AsyncEffect<P extends any[] = any[], R = Promise<any>>
  extends EffectFunc<P, R> {
  readonly _: {
    readonly model: string;
    readonly method: string;
    readonly hasRoom: '';
  };
  /**
   * 对同一effect函数的执行状态进行分类以实现独立保存。好处有：
   *
   * 1. 并发请求同一个请求时不会互相覆盖执行状态。
   * <br>
   * 2. 可以精确地判断业务中是哪个控件或者逻辑正在执行。
   *
   * ```typescript
   * model.effect.room(CATEGORY).execute(...);
   * ```
   *
   * @see useLoading(effect.room)
   * @see getLoading(effect.room)
   * @since 0.11.4
   *
   */
  readonly room: AsyncRoomEffect<P, R>;
  /**
   * @deprecated 请使用room函数
   * @see room
   */
  readonly assign: AsyncRoomEffect<P, R>;
}

export type PromiseEffect = AsyncEffect;
export type PromiseRoomEffect = AsyncRoomEffect;

interface EffectFunc<P extends any[] = any[], R = Promise<any>> {
  (...args: P): R;
}

export type EnhancedEffect<
  P extends any[] = any[],
  R = Promise<any>,
> = R extends Promise<any> ? AsyncEffect<P, R> : EffectFunc<P, R>;

type NonReadonly<T extends object> = {
  -readonly [K in keyof T]: T[K];
};

export const enhanceEffect = <State extends object>(
  ctx: EffectCtx<State>,
  methodName: string,
  effect: (...args: any[]) => any,
): EnhancedEffect => {
  const fn: NonReadonly<EnhancedEffect> & EffectFunc = function () {
    return execute(ctx, methodName, effect, toArgs(arguments));
  };

  fn._ = {
    model: ctx.name,
    method: methodName,
    hasRoom: '',
  };

  const room: NonReadonly<AsyncRoomEffect> & RoomFunc = (
    category: number | string,
  ) => ({
    execute() {
      return execute(ctx, methodName, effect, toArgs(arguments), category);
    },
  });

  room._ = Object.assign({}, fn._, {
    hasRoom: true as const,
  });

  fn.room = room;

  const assign: NonReadonly<AsyncRoomEffect> & RoomFunc = (
    category: number | string,
  ) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `请替换'${ctx.name}.${methodName}.assign'为'${ctx.name}.${methodName}.room'，'assign'方法将在版本1.0.0发布时删除`,
      );
    }

    return room(category);
  };
  assign._ = room._;
  fn.assign = assign;

  return fn;
};

const dispatchLoading = (
  modelName: string,
  methodName: string,
  loading: boolean,
  category: number | string = LOADING_CATEGORY,
) => {
  loadingStore.dispatch<LoadingAction>({
    type: TYPE_SET_LOADING,
    model: modelName,
    method: methodName,
    payload: { category, loading },
  });
};

const execute = <State extends object>(
  ctx: EffectCtx<State>,
  methodName: string,
  effect: (...args: any[]) => any,
  args: any[],
  category?: number | string,
) => {
  const modelName = ctx.name;
  const resultOrPromise = effect.apply(ctx, args);

  if (!isPromise(resultOrPromise)) {
    return resultOrPromise;
  }

  dispatchLoading(modelName, methodName, true, category);

  return resultOrPromise.then(
    (result) => {
      return dispatchLoading(modelName, methodName, false, category), result;
    },
    (e: unknown) => {
      dispatchLoading(modelName, methodName, false, category);
      throw e;
    },
  );
};
