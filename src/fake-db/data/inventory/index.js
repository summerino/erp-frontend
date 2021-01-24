import mock from '@/fake-db/mock.js'
import itemCategory from './item.category'
import itemGroup from './item.group'
import uom from './uom.conversion'

const data = {
  items: [{
    id: 1,
    code: 'ABC',
    name: 'AURORA BUTTER COOKIES',
    description: '',
    typeId: 6,
    typeName: 'Resell',
    qty: 100,
    uomId: 1,
    uomCode: 'DUS @ 6 KLG',
    categoryId: 33,
    categoryCode: 'F-S-B',
    categoryName: 'Makanan - Snack - Biskuit',
    uomSellId: 2,
    uomSellName: 'DUS',
    sellPrice: 243000.00,
    uomBuyId: 2,
    uomBuyName: 'DUS',
    buyPrice: 210609.00
  }, {
    id: 2,
    code: 'ABC120',
    name: 'ATM BUTTER 120 CHOCOLATE',
    description: '',
    typeId: 6,
    typeName: 'Resell',
    qty: 100,
    uomId: 2,
    uomCode: 'DUS @ 6 PAK X 20 BKS',
    categoryId: 33,
    categoryCode: 'F-S-B',
    categoryName: 'Makanan - Snack - Biskuit',
    uomSellId: 5,
    uomSellName: 'DUS',
    sellPrice: 45000.00,
    uomBuyId: 5,
    uomBuyName: 'DUS',
    buyPrice: 40800.00
  }, {
    id: 3,
    code: 'ABC24',
    name: 'ATM BUTTER 24 CHOCOLATE',
    description: '',
    typeId: 6,
    typeName: 'Resell',
    qty: 100,
    uomId: 3,
    uomCode: 'DUS @ 4 PAK X 6 BKS',
    categoryId: 33,
    categoryCode: 'F-S-B',
    categoryName: 'Makanan - Snack - Biskuit',
    uomSellId: 8,
    uomSellName: 'DUS',
    sellPrice: 63000.00,
    uomBuyId: 8,
    uomBuyName: 'DUS',
    buyPrice: 60000.00
  }, {
    id: 4,
    code: 'ABK',
    name: 'ATM BISKUIT KACANG',
    description: '',
    typeId: 6,
    typeName: 'Resell',
    qty: 100,
    uomId: 3,
    uomCode: 'DUS @ 4 PAK X 6 BKS',
    categoryId: 33,
    categoryCode: 'F-S-B',
    categoryName: 'Makanan - Snack - Biskuit',
    uomSellId: 8,
    uomSellName: 'DUS',
    sellPrice: 67000.00,
    uomBuyId: 8,
    uomBuyName: 'DUS',
    buyPrice: 61000.00
  }, {
    id: 5,
    code: 'ABN',
    name: 'ATM BISKUIT NANAS',
    description: '',
    typeId: 6,
    typeName: 'Resell',
    qty: 100,
    uomId: 3,
    uomCode: 'DUS @ 4 PAK X 6 BKS',
    categoryId: 33,
    categoryCode: 'F-S-B',
    categoryName: 'Makanan - Snack - Biskuit',
    uomSellId: 8,
    uomSellName: 'DUS',
    sellPrice: 64000.00,
    uomBuyId: 8,
    uomBuyName: 'DUS',
    buyPrice: 58000.00
  }, {
    id: 6,
    code: 'ABQ',
    name: 'ATM BONBIN QUARTO',
    description: '',
    typeId: 6,
    typeName: 'Resell',
    qty: 100,
    uomId: 3,
    uomCode: 'DUS @ 4 PAK X 6 BKS',
    categoryId: 33,
    categoryCode: 'F-S-B',
    categoryName: 'Makanan - Snack - Biskuit',
    uomSellId: 8,
    uomSellName: 'DUS',
    sellPrice: 45000.00,
    uomBuyId: 8,
    uomBuyName: 'DUS',
    buyPrice: 40000.00
  }, {
    id: 7,
    code: 'AC',
    name: 'ATM CAPUCINO',
    description: '',
    typeId: 6,
    typeName: 'Resell',
    qty: 100,
    uomId: 3,
    uomCode: 'DUS @ 4 PAK X 6 BKS',
    categoryId: 33,
    categoryCode: 'F-S-B',
    categoryName: 'Makanan - Snack - Biskuit',
    uomSellId: 8,
    uomSellName: 'DUS',
    sellPrice: 45000.00,
    uomBuyId: 8,
    uomBuyName: 'DUS',
    buyPrice: 40800.00
  }]
}

mock.onPost('/api/item/list').reply((request) => {
  var category = []
  var searchBy = ''
  var search = ''

  if (request.data) {
    var { category, searchBy, search } = JSON.parse(request.data)
  }

  let results = data.items.filter(i => {
    if (category.length > 0) return category.includes(i.categoryId)
    else return i
  })
  
  results = results.filter(i => {
    if (searchBy.toLowerCase() == 'code') return i.code.toLowerCase().includes(search.toLowerCase())
    else if (searchBy.toLowerCase() == 'type') return i.typeName.toLowerCase().includes(search.toLowerCase())
    else return i.name.toLowerCase().includes(search.toLowerCase())
  })
  
  return [200, results]
})
