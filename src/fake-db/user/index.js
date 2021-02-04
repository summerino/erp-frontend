import mock from '@/fake-db/mock.js'
import jwt from 'jsonwebtoken'

const data = {
  users: [{
    uid: 34,
    displayName: 'John Doe',
    password: 'admin',
    username: 'admin@admin.com'
  }]
}

const jwtConfig = {
  'secret'   : 'dd5f3089-40c3-403d-af14-d0c228b05cb4',
  'expireTime': 432000
}

mock.onPost('/api/auth/login').reply((request) => {
  const { username, password } = JSON.parse(request.data)

  let error = 'Something went wrong'

  const user = data.users.find(user => user.username === username && user.password === password)

  if (user) {
    try {
      const accessToken = jwt.sign({id: user.uid}, jwtConfig.secret, {expiresIn: jwtConfig.expireTime})

      const userData = Object.assign({}, user, {providerId: 'jwt'})

      delete userData.password

      const response = {
        userData,
        accessToken
      }

      return [200, response]
    } catch (e) {
      error = e
    }
  } else {
    error = 'The username / password combination is invalid.'
  }

  return [200, {error}]
})

mock.onPost('/api/auth/logout').reply((request) => {
  return [200, {}]
})
