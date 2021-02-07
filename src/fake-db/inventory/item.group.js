import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.inventory.item.group}`).reply(async (config) => {
  const response = await axiosJsonServer.get('/itemGroups')

  return [response.status, response.data]
})
