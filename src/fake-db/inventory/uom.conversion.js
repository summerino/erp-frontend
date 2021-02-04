import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onPost('/api/uom-conversion/list').reply(async (request) => {
  const { uomId } = JSON.parse(request.data)

  const response = await axiosJsonServer.get(`/uomConversions?uomId=${uomId}&_sort=seq`)

  return [response.status, response.data]
})
