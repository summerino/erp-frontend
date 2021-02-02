import mock from '@/fake-db/mock.js'

mock.onPost('/api/uom/list').reply(async (request) => {
  const response = await axiosJsonServer.get('/uoms')

  return [response.status, response.data]
})
