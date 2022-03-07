import React from 'react'
import { appContext, store, connect } from './redux'
import './App.css'

function App() {
	return (
		<appContext.Provider value={store}>
			<One />
			<Two />
			<Three />
		</appContext.Provider>
	)
}

const One = () => (
	<section>
		One
		<User />
	</section>
)
const Two = () => (
	<section>
		Two
		<UserModify>内容</UserModify>
	</section>
)
const Three = connect(state => {
  return {
    group:state.group
  }
})(({ group }) => <section>Three{ group.name }</section>)
const User = connect((state) => {
	return { user: state.user }
})(({ user }) => {
	return <div>User:{user.name}</div>
})

const UserModify = connect()(({ state, dispatch, children }) => {
	const onChange = (e) => {
		dispatch({
			type: 'updateUser',
			payload: { name: e.target.value },
		})
	}
	return (
		<div>
			{children}
			<input type='text' value={state.user.name} onChange={onChange} />
		</div>
	)
})

export default App
