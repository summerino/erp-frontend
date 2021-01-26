import data from '@/fake-db/db.json'
import mock from '@/fake-db/mock.js'
import axios from 'axios'

import itemCategory from './item.category'
import itemGroup from './item.group'
import uom from './uom.conversion'

mock.onPost('/api/item/list').reply((request) => {
  var category = []
  var searchBy = ''
  var search = ''
  
  if (request.data) {
    var { category, searchBy, search } = JSON.parse(request.data)
  }
  
  let results = data.items.filter(i => {
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

mock.onGet(/\/api\/item\/\d+/).reply((config) => {
  const url = config.url.split('/')
  const id = url[url.length - 1]

  const results = data.items.find(i => i.id == id)

  return [200, results]
})
