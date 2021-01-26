import data from '@/fake-db/db.json'
import mock from '@/fake-db/mock.js'

mock.onPost('/api/item/list').reply((request) => {
  // const {username, password} = JSON.parse(request.data)

  const datas = data.itemGroups

  return [200, datas]
})
