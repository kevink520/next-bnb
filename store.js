import { createStore, action } from 'easy-peasy'

export default createStore({
  modals: {
    showModal: false,
    showLoginModal: false,
    showRegistrationModal: false,
    setShowModal: action(state => state.showModal = true),
    setHideModal: action(state => state.showModal = false),
    setShowLoginModal: action(state => {
      state.showRegistrationModal = false
      state.showLoginModal = true
      state.showModal = true
    }),
    setShowRegistrationModal: action(state => {
      state.showLoginModal = false
      state.showRegistrationModal = true
      state.showModal = true
    })
  }
})

