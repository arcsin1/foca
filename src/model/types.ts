import type { AnyAction } from 'redux';
import type { EnhancedEffect } from './enhanceEffect';
import type { ComputedRef } from '../reactive/types';

export interface GetName<Name extends string> {
  /**
   * 模型名称。请在定义模型时确保是唯一的字符串
   */
  readonly name: Name;
}

export interface GetState<State> {
  /**
   * 模型的实时状态
   */
  readonly state: State;
}

export interface GetInitialState<State> {
  /**
   * 模型的初始状态，每次获取该属性都会执行深拷贝操作
   */
  readonly initialState: State;
}

export interface ModelPersist<State extends object> {
  /**
   * 持久化版本号，数据结构变化后建议立即升级该版本。默认值：0
   */
  version?: number | string;
  /**
   * 持久化数据活跃时间（ms)，默认：Infinity
   */
  maxAge?: number;
  /**
   * 持久化数据恢复到模型时的过滤函数，此时可修改数据以满足业务需求。
   * 如果数据结构变化，则建议直接更新版本号。
   */
  decode?: (state: State) => State | void;
}

export interface ActionCtx<State extends object>
  extends GetName<string>,
    GetInitialState<State> {}

export interface EffectCtx<State extends object>
  extends ActionCtx<State>,
    GetState<State> {
  /**
   * 立即更改状态，支持**immer**操作
   *
   * ```typescript
   * this.setState((state) => {
   *   state.count += 1;
   * });
   * ```
   *
   * 如果你是要替换**全部状态**，可以直接传给setState
   *
   * ```typescript
   * this.setState({ count: 10 });
   * ```
   */
  setState(state: State): AnyAction;
  setState(fn: (state: State) => State | void): AnyAction;
}

export interface ComputedCtx<State extends object>
  extends GetName<string>,
    GetState<State> {}

export interface BaseModel<Name extends string, State extends object>
  extends GetState<State>,
    GetName<Name> {}

type ModelActionItem<
  State extends object,
  Action extends object,
  K extends keyof Action,
> = Action[K] extends (state: State, ...args: infer P) => State | void
  ? (...args: P) => AnyAction
  : never;

type ModelAction<State extends object, Action extends object> = {
  readonly [K in keyof Action]: ModelActionItem<State, Action, K>;
};

type GetPrivateMethodKeys<Method extends object> = {
  [K in keyof Method]: K extends `_${string}` ? K : never;
}[keyof Method];

type ModelEffect<Effect extends object> = {
  readonly [K in keyof Effect]: Effect[K] extends (...args: infer P) => infer R
    ? EnhancedEffect<P, R>
    : never;
};

type ModelComputed<Computed extends object> = {
  readonly [K in keyof Computed]: Computed[K] extends () => infer R
    ? ComputedRef<R>
    : never;
};

export type Model<
  Name extends string = string,
  State extends object = object,
  Action extends object = object,
  Effect extends object = object,
  Computed extends object = object,
> = BaseModel<Name, State> &
  // [K in keyof Action as K extends `_${string}` ? never : K]
  // 上面这种看起来简洁，业务代码提示也正常，但是业务代码那边无法点击跳转进模型了。
  // 所以需要先转换所有的属性，再把私有属性去除。
  Omit<ModelAction<State, Action>, GetPrivateMethodKeys<Action>> &
  Omit<ModelEffect<Effect>, GetPrivateMethodKeys<Effect>> &
  Omit<ModelComputed<Computed>, GetPrivateMethodKeys<Computed>>;

export type InternalModel<
  Name extends string = string,
  State extends object = object,
  Action extends object = object,
  Effect extends object = object,
  Computed extends object = object,
> = BaseModel<Name, State> & {
  readonly _$opts: DefineModelOptions<State, Action, Effect, Computed>;
};

export type InternalAction<State extends object> = {
  [key: string]: (state: State, ...args: any[]) => State | void;
};

export interface Event<State> {
  /**
   * store初始化完成，并且持久化（如果有）的数据也已经恢复。
   *
   * 上下文 **this** 可以直接调用actions和effects的函数以及computed计算属性。
   */
  onInit?: () => void;
  /**
   * 每当state有变化时的回调通知。
   *
   * 初始化(onInit)执行之前不会触发该回调。如果在onInit中做了修改state的操作，则会触发该回调。
   *
   * 上下文 **this** 可以直接调用actions和effects的函数以及computed计算属性，请谨慎执行修改数据的操作以防止死循环。
   */
  onChange?: (prevState: State, nextState: State) => void;
}

export interface EventCtx<State extends object>
  extends GetName<string>,
    GetState<State> {}

export interface DefineModelOptions<
  State extends object,
  Action extends object,
  Effect extends object,
  Computed extends object,
> {
  /**
   * 初始状态
   *
   * ```typescript
   * cosnt initialState: {
   *   count: number;
   * } = {
   *   count: 0,
   * }
   *
   * const model = defineModel('model1', {
   *   initialState
   * });
   * ```
   */
  initialState: State;
  /**
   * 定义修改状态的方法。参数一自动推断为state类型。支持**immer**操作。支持多参数。
   *
   * ```typescript
   * const model = defineModel('model1', {
   *   initialState,
   *   actions: {
   *     plus(state, step: number) {
   *       state.count += step;
   *     },
   *     minus(state, step: number, scale: 1 | 2) {
   *       state.count -= step * scale;
   *     }
   *   },
   * });
   * ```
   */
  actions?: Action & InternalAction<State> & ThisType<ActionCtx<State>>;
  /**
   * 定义普通方法，异步方法等。
   * 调用effect方法时，一般会伴随异步操作（请求数据、耗时任务），框架会自动收集当前方法的调用状态。
   *
   * ```typescript
   * const model = defineModel('model1', {
   *   initialState,
   *   effects: {
   *     async foo(p1: string, p2: number) {
   *       const result = await Promise.resolve();
   *       this.setState({ x: result });
   *       return 'OK';
   *     }
   *   },
   * });
   *
   * useLoading(model.foo); // 返回值类型: boolean
   * ```
   */
  effects?: Effect &
    ThisType<
      ModelAction<State, Action> &
        Effect &
        ModelComputed<Computed> &
        EffectCtx<State>
    >;
  /**
   * 定义计算属性。针对需要复杂的计算才能得出结果的场景而设计。如果只是简单的返回，建议使用`effects`
   *
   * ```typescript
   * const initialState = { firstName: 'tick', lastName: 'tock' };
   *
   * const model = defineModel('model1', {
   *   initialState,
   *   computed: {
   *     fullname() {
   *       return this.state.firstName + '.' + this.state.lastName;
   *     },
   *     names() {
   *       return this.fullName.value.split('').map((item) => `[${item}]`);
   *     }
   *   },
   * });
   * ```
   *
   * 可以单独使用：
   * ```typescript
   * model.fullname; // ComputedRef<string>;
   * model.fullname.value; // string;
   * ```
   *
   * 可以配合react hooks使用：
   *
   * ```typescript
   * const fullname = useComputed(model.fullname); // string
   * ```
   */
  computed?: Computed & ThisType<ModelComputed<Computed> & ComputedCtx<State>>;
  /**
   * 是否阻止刷新数据时跳过当前模型，默认即不跳过。
   *
   * 如果是强制刷新，则该参数无效。
   *
   * @see store.refresh(force: boolean = false)
   */
  skipRefresh?: boolean;
  /**
   * 定制持久化，请确保已经在初始化store的时候把当前模型加入persist配置，否则当前设置无效
   *
   * @see store.init()
   */
  persist?: ModelPersist<State> & ThisType<null>;
  /**
   * 生命周期
   * @since 0.11.1
   */
  events?: Event<State> &
    ThisType<
      ModelAction<State, Action> &
        ModelComputed<Computed> &
        Effect &
        EventCtx<State>
    >;
  /**
   * @deprecated 容易与react的hooks产生歧义，请替换成：events
   *
   * ```diff
   * defineModel('test', {
   * -  hooks: {},
   * +  events: {},
   * });
   * ```
   */
  hooks?: Event<State> &
    ThisType<
      ModelAction<State, Action> &
        ModelComputed<Computed> &
        Effect &
        EventCtx<State>
    >;
}
