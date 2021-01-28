import data from '@/fake-db/db.json'
import mock from '@/fake-db/mock.js'

mock.onPost('/api/tax/lists').reply((request) => {
  const { src } = JSON.parse(request.data)
  
  let results = data.taxes.filter(t => {
    if (src.toLowerCase() == 'sls') return t.showInSales == 1
    else return t
  })
  results.unshift({ code: '000', name: 'No Tax', rate: 0.0 })
  
  return [200, results]
})
