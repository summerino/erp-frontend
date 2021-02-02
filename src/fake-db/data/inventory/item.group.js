import mock from '@/fake-db/mock.js'

mock.onPost('/api/item/group/list').reply(async (request) => {
  const response = await axiosJsonServer.get('/itemGroups')

  return [response.status, response.data]
})
