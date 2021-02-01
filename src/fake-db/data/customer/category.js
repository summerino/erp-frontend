import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onPost('/api/customer/category/list').reply(async (request) => {
  const response = await axiosJsonServer.get('/customerCategories')

  return [response.status, response.data]
})
