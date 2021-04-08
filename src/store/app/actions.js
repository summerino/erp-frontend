const showToast = ({ state, commit }, message) => {
  if (state.toast.show) commit('hideToast')

  setTimeout(() => {
    commit('showToast', {
      color: 'black',
      icon: '',
      message,
      timeout: 4000
    })
  })
}

const showInfo = ({ state, commit }, message) => {
  if (state.toast.show) commit('hideToast')

  setTimeout(() => {
    commit('showToast', {
      color: 'blue',
      icon: 'mdi-information-outline',
      message,
      timeout: 4000
    })
  })
}

const showWarning = ({ state, commit }, message) => {
  if (state.toast.show) commit('hideToast')

  setTimeout(() => {
    commit('showToast', {
      color: 'warning',
      icon: 'mdi-alert-outline',
      message,
      timeout: 4000
    })
  })
}

const showError = ({ state, commit }, message) => {
  if (state.toast.show) commit('hideToast')

  setTimeout(() => {
    commit('showToast', {
      color: 'error',
      icon: 'mdi-alert-circle-outline',
      message,
      timeout: 5000
    })
  })
}

const showSuccess = ({ state, commit }, message) => {
  if (state.toast.show) commit('hideToast')

  setTimeout(() => {
    commit('showToast', {
      color: 'green darken-2',
      message,
      timeout: 4000
    })
  })
}

export default {
  showToast,
  showInfo,
  showWarning,
  showError,
  showSuccess
}
