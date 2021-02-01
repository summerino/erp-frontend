import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onPost('/api/tax/lists').reply(async (request) => {
  const { src } = JSON.parse(request.data)
  
  const response = await axiosJsonServer.get('/taxes')
  
  let results = response.data.filter(t => {
    if (src.toLowerCase() == 'sls') return t.showInSales == 1
    else return t
  })
  results.unshift({ code: '000', name: 'No Tax', rate: 0.0 })
  
  return [200, results]
})
