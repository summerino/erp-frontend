import data from '@/fake-db/db.json'
import mock from '@/fake-db/mock.js'
import { orderBy as _orderBy } from 'lodash'

mock.onPost('/api/uom-conversion/list').reply((request) => {
  const { uomId } = JSON.parse(request.data)

  let results = data.uomConversions.filter(c => c.uomId == uomId)

  results = _orderBy(results, 'seq');
  
  return [200, results]
})
