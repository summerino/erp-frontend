import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.inventory.item.item}`).reply(async (config) => {
  var category = []
  var searchBy = ''
  var search = ''
  
  if (config.params) {
    var { category, searchBy, search } = config.params
  }

  const response = await axiosJsonServer.get('/items')
  
  let results = response.data.filter(i => {
    if (category.length > 1) return category.includes(i.categoryId)
    else return i
  })
  
  results = results.filter(i => {
    if (searchBy.toLowerCase() == 'code') return i.code.toLowerCase().includes(search.toLowerCase())
    else if (searchBy.toLowerCase() == 'type') return i.typeName.toLowerCase().includes(search.toLowerCase())
    else return i.name.toLowerCase().includes(search.toLowerCase())
  })
  
  return [200, results]
})

mock.onGet(/\/api\/item\/\d+/).reply(async (config) => {
  const url = config.url.split('/')
  const id = url[url.length - 1]

  const response = await axiosJsonServer.get(`/items/${id}`)

  return [response.status, response.data]
})
