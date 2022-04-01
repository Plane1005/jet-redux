# 复现redux
##### 本项目对redux进行一个简单复现，下面介绍api、实现及其作用
芝士点
- HOC，高阶组件
- 发布-订阅模式
- React  Context
- 函数柯里化
---

- **state**：redux保存的总数据
- **reducer**：统一更改 **state** 的函数，通过 **type** 值对应不同的更改操作
- **listeners**：储存监听函数列表，通过发布订阅模式通知组件更改数据

### Store
- **getState**：返回 **state**
- **dispatch**：接受一个 **action**，将 **state** 和 **action** 传递给 **reducer** 返回一个 **newState** 后，传递给 **setState** 更改 **state**
- **subscribe**：接受一个订阅函数，将其推入 **listeners** 数组，完成订阅过程。返回一个取消订阅的函数，通过闭包保存传入的函数，执行时再将其从监听函数数组中去除
``` javaScript
const store = {
	getState: () => {
		return state
	},
	dispatch: (action) => {
		setState(reducer(state, action))
	},
	subscribe: (fn) => {
		listeners.push(fn)
		return () => {
			const index = listeners.indexOf(fn)
			listeners.splice(index, 1)
		}
	},
}
```

## setState
接收 **newState** 将其赋值给 **state**，并遍历执行 **listeners** 中的函数，发布通知声明  **state** 已经改变

```javaScript
const setState = (newState) => {
	// console.log(newState)
	state = newState
	listeners.map((fn) => fn(state))
}
```

## Provider
通过 **React.createContext** 创建一个可以向子组件传递数据的对象，返回一个携带者store的组件，这样在项目的任何地方都可以通过 **appContext** 访问到 **store**，不用像 **props** 那样一层一层传递下去

``` javaScript
export const appContext = React.createContext(null)
export const Provider = ({ store, children }) => {
	return <appContext.Provider value={store}>{children}</appContext.Provider>
}
```

## createStore
接受一个 **initstate** 作为 **store** 的初始化对象和一个 **reducer** 函数，**将其赋值给store** 的 **state** 与 **reducer**，并返回 **store**

``` javaScript
export const createStore = (initState, _reducer) => {
	state = initState
	reducer = _reducer
	return store
}
```

## reducer
**reducer** 接受两个参数，**state** 以及 **action** 对象，并返回处理后新的 **state**

``` javaScript
const reducer = (state, { type, payload }) => {
	if (type === 'updateUser') {
		return {
			...state,
			user: {
				...state.user,
				...payload,
			},
		}
	} else {
		return state
	}
}
```

## connect
- **connect** 是一个高阶函数，来源于 **react-redux**，它真正连接 **Redux** 和 **React**，它包在我们的容器组件的外一层，它接收上面 **Provider** 提供的 **store** 里面的 **state** 和 **dispatch**，传给一个构造函数，返回一个对象，以属性形式传给我们的容器组件。首先传入 **stateSelector**、**dispatchSelector**，然后返回一个生产 **Component** 的函数，再传入需要处理的 **Component**，返回生产后的 **Component**
``` javaScript
export const connect = (stateSelector, dispatchSelector) => (Component) => {
	return (props) => {
		const [, setRender] = useState({})
		const data = stateSelector ? stateSelector(state) : { state }
		const dispatchers = dispatchSelector
			? dispatchSelector(dispatch)
			: { dispatch: dispatch }
		useEffect(() => {
			return store.subscribe(() => {
				const newData = stateSelector ? stateSelector(state) : { state }
				if (isChanged(data, newData)) {
					setRender({})
				}
			})
		}, [stateSelector])
		return <Component {...props} {...data} {...dispatchers} />
	}
}
```
- **stateSelector**、**dispatchSelector** 的作用是简化代码，使得目标组件可以获得想要的  **state**，和定制所需要的 **dispatch** 动作，简化组件内 **dispatch** 代码
- 在组件被创建时，会将其推入 **listeners** 监听数组中，订阅 **state**，当 **state** 变化后，将旧的 **data** 与 **newData** 进行比较，如果有变化，就重新渲染组件，实现数据的更新。并且由于 **stateSelector** 的存在，可以使得我们进行单独私人性的订阅，只有在自己订阅的数据发生变化时才进行重渲染，避免资源浪费，实现精准渲染
（因为 **data** 是我们在上一次渲染时获得的数据，所以是旧的，而 **newData** 使我们在收到 **state** 的更新通知后才取得的，所以是新的）
- 接收传入组件的 **props**，再将原组件的 **props**、**state** 和 **dispatch**返回，实现连接 **redux** 的组件逻辑复用

## 实现函数Action
- 如果我们想在函数内做到 **dispatch**，但是这个函数脱离组件访问不到 **dispatch**，这就导致我们需要将 **dispatch** 作为参数传入需要的函数，类似 `fetchUser(dispatch)`，但是如果我们想做到 `dispatch(fetchUser)`，需要的工作就是对于传入 **dispatch** 的函数进行判断是否是 **Function**，如果是就将 **dispatch**作为参数调用它，这就是 **redux-thunk** 库所做的工作
``` javaScript
let dispatch = store.dispatch
const preDispatch = dispatch
dispatch = (action) => {
	if (action instanceof Function) {
		action(dispatch) 
	} else {
		preDispatch(action)
	}
}
```
- 传入的参数是 **dispatch** 而非 **preDispatch** 的原因是有可能传入的 **action** 还会返回一个函数

## 实现函数PromiseAction
- 如果想要做到传入的 **action.payload** 是一个 **Promise** 类型的任务，那我们需要给这个 **Promise** 设置 **then** 的任务，获取到 **Promise** 的结果后，将原有的 **action.payload** 替换为 **Promise** 的结果
``` javaScript
const preDispatch2 = dispatch
dispatch = (action) => {
  if (action.payload instanceof Promise) {
		action.payload.then((data) => {
			dispatch({ ...action, payload: data })
		})
	} else {
		preDispatch2(action)
	}
}
```
- 传入的参数是 **dispatch** 而非 **preDispatch** 的原因是有可能 **then** 还会返回一个 **Promise**

---
自此就完成了对 **redux** 的小小复现
