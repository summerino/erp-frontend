import data from '@/fake-db/db.json'
import mock from '@/fake-db/mock.js'

mock.onPost('/api/customer/category/list').reply((request) => {
  const datas = data.customerCategories

  return [200, datas]
})
