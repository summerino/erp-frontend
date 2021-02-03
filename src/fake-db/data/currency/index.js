import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onPost('/api/currency/lists').reply(async (request) => {
  var filter = null
  if (request.data) {
    var { filter } = JSON.parse(request.data)
  }
  filter = filter || ''

  const response = await axiosJsonServer.get(`/currencies?code_like=${filter}&_sort=sort`)
  
  return [response.status, response.data]
})
