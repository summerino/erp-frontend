import data from '@/fake-db/db.json'
import mock from '@/fake-db/mock.js'

mock.onPost('/api/uom/list').reply((request) => {
  const datas = data.uoms

  return [200, datas]
})
