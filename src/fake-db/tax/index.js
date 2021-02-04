import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.general.tax}`).reply(async (config) => {
  const { src } = config.params
  
  const response = await axiosJsonServer.get('/taxes')
  
  let results = response.data.filter(t => {
    if (src.toLowerCase() == 'sls') return t.showInSales == 1
    if (src.toLowerCase() == 'purc') return t.showInPurchase == 1
    else return t
  })
  results.unshift({ code: '000', name: 'No Tax', rate: 0.0 })
  
  return [200, results]
})
