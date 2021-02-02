import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onPost('/api/item/category/list').reply(async (request) => {
  const response = await axiosJsonServer.get('/itemCategories')

  return [response.status, response.data]
})

mock.onGet('/api/item/category/hierarchy').reply(async () => {
  const response = await axiosJsonServer.get('/itemCategories')
  
  const datas = [{
    id: 0,
    name: 'All Category',
    children: defineChildNodes(response.data, null)
  }]

  return [200, datas]
})

function defineChildNodes(datas, parentId) {
  const nodes = datas
    .filter(c => c.parentId == parentId)
    .map(itemChildren => {
      const result = {}

      result.id = itemChildren.id
      result.name = itemChildren.name
      result.children = defineChildNodes(datas, itemChildren.id)

      return result
    })
    
  return nodes
}
