import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.inventory.uom.conversion}`).reply(async (config) => {
  const { uomId } = config.params

  const response = await axiosJsonServer.get(`/uomConversions?uomId=${uomId}&_sort=seq`)

  return [response.status, response.data]
})
