# FOCA

流畅的 react 状态管理库，基于[redux](https://github.com/reduxjs/redux)和[react-redux](https://github.com/reduxjs/react-redux)。简洁、极致、高效。

[![npm peer dependency version](https://img.shields.io/npm/dependency-version/foca/peer/react?logo=react)](https://github.com/facebook/react)
[![GitHub Workflow Status (branch)](https://img.shields.io/github/workflow/status/foca-js/foca/Test/master?label=test&logo=jest)](https://github.com/foca-js/foca/actions)
[![Codecov](https://img.shields.io/codecov/c/github/foca-js/foca?logo=codecov)](https://codecov.io/gh/foca-js/foca)
[![npm](https://img.shields.io/npm/v/foca?logo=npm)](https://www.npmjs.com/package/foca)
[![npm bundle size (version)](https://img.shields.io/bundlephobia/minzip/foca?label=bundle+size&cacheSeconds=3600&logo=esbuild)](https://bundlephobia.com/package/foca@latest)
![GitHub top language](https://img.shields.io/github/languages/top/foca-js/foca?logo=typescript)
[![License](https://img.shields.io/github/license/foca-js/foca?logo=open-source-initiative)](https://github.com/foca-js/foca/blob/master/LICENSE)
[![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/foca-js/foca?label=code%20quality&logo=lgtm)](https://lgtm.com/projects/g/foca-js/foca)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?logo=prettier)](https://github.com/prettier/prettier)
[![Gitter](https://img.shields.io/gitter/room/foca-js/foca?logo=gitter)](https://gitter.im/foca-js/foca)

<br>

![mind map](./mindMap.svg)

# 安装

```bash
# 如果是 yarn
yarn add foca

# 如果是 npm
npm install foca
```

# 特性

#### 模块化开发，导出即可使用

一个模型包含了状态操作的所有方法，基础代码全部剥离，不再像原生 redux 一般拆分成 action/types/reducers 三个文件，既不利于管理，又难以在提示上关联起来。

定义完模型，导出即可在组件中使用，不用再怕忘记注册或者嫌麻烦了。

#### 专注 TS 极致体验，100%类型提示

无 TS 不编程，foca 提供 **100%** 的基础类型提示，能产生一种提示上瘾的快感，而你只需关注业务中的类型。

#### 内置 [immer](https://github.com/immerjs/immer) 响应式修改数据

可以说加入 immer 是非常有必要的，当 reducer 数据多层嵌套时，你不必再忍受更改里层的数据而不断使用 rest/spread(...)扩展符的烦恼，相反地，直接赋值就好了，其他的交给 immer 搞定。

#### 支持 computed 计算属性，自动收集依赖

不需要再羡慕`vue`或者`mobx`等框架的计算属性了，foca 虽然基于 redux，但是也能支持计算属性并且自动收集依赖，大大降低了心智负担。

#### 支持私有方法

一个前置下划线(`_`)就能让方法变成私有的，外部使用时 TS 不会提示私有方法和私有变量，简单好记又省心。

#### 自动管理异步函数的 loading 状态

我们总是想知道某个异步方法（或者请求）正在执行，然后在页面上渲染出`loading...`字样，幸运地是框架自动（按需）为你记录了执行状态。

#### 可定制的多引擎数据持久化

某些数据在一个时间段内可能是不变的，比如登录凭证 token。所以你想着先把数据存到本地，下次自动恢复到模型中，这样用户就不需要频繁登录了。

# 生态

#### 网络请求

| 仓库                                                                        | 版本                                                                                                                | 描述                           | 平台      |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------ | --------- |
| [axios](https://github.com/axios/axios)                                     | [![npm](https://img.shields.io/npm/v/axios)](https://www.npmjs.com/package/axios)                                   | 当下最流行的请求库             | React, RN |
| [foca-axios](https://github.com/foca-js/foca-axios)                         | [![npm](https://img.shields.io/npm/v/foca-axios)](https://www.npmjs.com/package/foca-axios)                         | axios 适配器，节流、缓存、重试 | React, RN |
| [foca-miniprogram-axios](https://github.com/foca-js/foca-miniprogram-axios) | [![npm](https://img.shields.io/npm/v/foca-miniprogram-axios)](https://www.npmjs.com/package/foca-miniprogram-axios) | axios 适配器，节流、缓存、重试 | Taro      |

#### 存储引擎

| 仓库                                                                                      | 版本                                                                                                                                                      | 描述                    | 平台  |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ----- |
| [react-native-async-storage](https://github.com/react-native-async-storage/async-storage) | [![npm](https://img.shields.io/npm/v/@react-native-async-storage/async-storage)](https://www.npmjs.com/package/@react-native-async-storage/async-storage) | React-Native 持久化引擎 | RN    |
| [foca-taro-storage](https://github.com/foca-js/foca-taro-storage)                         | [![npm](https://img.shields.io/npm/v/foca-taro-storage)](https://www.npmjs.com/package/foca-taro-storage)                                                 | Taro 持久化引擎         | Taro  |
| [localForage](https://github.com/localForage/localForage)                                 | [![npm](https://img.shields.io/npm/v/localforage)](https://www.npmjs.com/package/localforage)                                                             | 浏览器端持久化引擎      | React |

#### 日志

| 仓库                                                                       | 版本                                                                                                                      | 描述           | 平台            |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------- | --------------- |
| [@redux-devtools/extension](https://github.com/reduxjs/redux-devtools)     | [![npm](https://img.shields.io/npm/v/@redux-devtools/extension)](https://www.npmjs.com/package/@redux-devtools/extension) | 浏览器日志插件 | React, RN       |
| [react-native-debugger](https://github.com/jhen0409/react-native-debugger) | [![npm](https://img.shields.io/npm/v/react-native-debugger)](https://www.npmjs.com/package/react-native-debugger)         | 日志应用程序   | RN              |
| [redux-logger](https://github.com/LogRocket/redux-logger)                  | [![npm](https://img.shields.io/npm/v/redux-logger)](https://www.npmjs.com/package/redux-logger)                           | 控制台输出日志 | React, RN, Taro |

# 例子

React 案例仓库：https://github.com/foca-js/foca-demo-web
<br>
RN 案例仓库：https://github.com/foca-js/foca-demo-react-native
<br>
Taro 案例仓库：https://github.com/foca-js/foca-demo-taro
<br>
Nextjs 案例仓库：https://github.com/foca-js/foca-demo-nextjs
<br>

# 在线试玩

<iframe src="https://codesandbox.io/embed/foca-demos-e8rh3?fontsize=14&hidenavigation=1&theme=dark&view=preview"
     style="width:100%; height:600px; border:0; border-radius: 4px; overflow:hidden;"
     title="foca-demos"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
