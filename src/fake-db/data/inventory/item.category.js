import data from '@/fake-db/db.json'
import mock from '@/fake-db/mock.js'

mock.onPost('/api/item/category/list').reply((request) => {
  const datas = data.itemCategories

  return [200, datas]
})

mock.onGet('/api/item/category/hierarchy').reply(() => {
  const datas = [{
    id: 0,
    name: 'All Category',
    children: defineChildNodes(null)
  }]

  return [200, datas]
})

function defineChildNodes(parentId) {
  const nodes = data.itemCategories
    .filter(c => c.parentId == parentId)
    .map(itemChildren => {
      const result = {}

      result.id = itemChildren.id
      result.name = itemChildren.name
      result.children = defineChildNodes(itemChildren.id)

      return result
    })
    
  return nodes
}
