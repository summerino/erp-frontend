import { format } from 'date-fns'

import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.sales.delivery}`).reply(async (config) => {
  var search = null
  if (config.params) {
    var { search } = config.params
  }
  search = search || ''

  const resp_h = await axiosJsonServer.get(`/deliveryOrder_H?q=${search}`)
  const resp_c = await axiosJsonServer.get(`/customers`)

  var results = []
  for (var i = 0; i < resp_h.data.length; i++) {
    const cust = resp_c.data.find(c => c.code == resp_h.data[i].custCode)
    
    const result = resp_h.data[i]
    result.custName = cust ? cust.name : ''
    
    results.push(result)
  }

  return [200, results]
})

mock.onGet(`/api/${endpoint.sales.delivery}/item`).reply(async (config) => {
  const { code } = config.params
  
  const response = await axiosJsonServer.get(`/deliveryOrder_D?code=${code}`)

  return [response.status, response.data]
})

mock.onGet(/\/api\/delivery-order\/uninv\/./).reply(async (config) => {
  const urlSegment = config.url.split('/')
  var searchBy = ''
  var search = ''

  if (config.params) {
    var { searchBy, search } = config.params
  }
  searchBy = searchBy.toLowerCase()
  search = search.toLowerCase()
  
  const resp_h = await axiosJsonServer.get(`/deliveryOrder_H?custCode=${urlSegment[urlSegment.length - 1]}`)
  
  let results = resp_h.data.filter(h => {
    if (searchBy == 'code') return h.code.toLowerCase().includes(search)
    else if (searchBy == 'socode') return h.soCode.toLowerCase().includes(search)
    else return h
  })

  return [200, results]
})

mock.onPost(`/api/${endpoint.sales.delivery}`).reply(async (request) => {
  const data = JSON.parse(request.data)
  
  const response_h = await axiosJsonServer.get('/deliveryOrder_H')
  const data_h = response_h.data

  const code = data_h.length > 0
    ? `DO${(data_h[data_h.length - 1].id + 1).toString().padStart(6, '0')}`
    : 'DO000001'
  
  // Insert delivery order header
  axiosJsonServer.post('/deliveryOrder_H', {
    code: code,
    deliveryDate: data.deliveryDate,
    soCode: data.soCode,
    custCode: data.custCode,
    deliveryAddr: data.deliveryAddr,
    warehouseCode: data.warehouseCode,
    notes: data.notes,
    shippedBy: data.shippedBy,
    approveBy: data.approveBy,
    dpp: data.dpp,
    subTotal: data.subTotal,
    finalDisc: data.finalDisc,
    taxAmount: data.taxAmount,
    total: data.total,
    createdBy: data.createdBy,
    createdDate: format(new Date(), 'yyyy-MM-dd'),
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Insert delivery order details
  for (var i = 0; i < data.itemDetails.length; i++) {
    axiosJsonServer.post('/deliveryOrder_D', {
      rowId: data.itemDetails[i].rowId,
      code: code,
      lineNo: (i + 1),
      itemId: data.itemDetails[i].itemId,
      itemCode: data.itemDetails[i].itemCode,
      itemName: data.itemDetails[i].itemName,
      orderQty: data.itemDetails[i].orderQty,
      qty: data.itemDetails[i].qty,
      uomId: data.itemDetails[i].uomId,
      unitId: data.itemDetails[i].unitId,
      unitName: data.itemDetails[i].unitName,
      unitPrice: data.itemDetails[i].unitPrice,
      itemSellPrice: data.itemDetails[i].itemSellPrice,
      disc: data.itemDetails[i].disc,
      nettPrice: data.itemDetails[i].nettPrice,
      total: data.itemDetails[i].total,
      description: data.itemDetails[i].description,
      typeId: data.itemDetails[i].typeId
    })
  }

  return [200, { success: true, message: 'Success insert record.' }]
})

mock.onPut(/\/api\/delivery-order\/./).reply(async (config) => {
  let { data } = config
  data = JSON.parse(data)
  
  const response_h = await axiosJsonServer.get(`/deliveryOrder_H?code=${data.code}`)
  const id = response_h.data[0].id

  // Update delivery order header
  axiosJsonServer.put(`/deliveryOrder_H/${id}`, {
    code: data.code,
    deliveryDate: data.deliveryDate,
    soCode: data.soCode,
    custCode: data.custCode,
    deliveryAddr: data.deliveryAddr,
    warehouseCode: data.warehouseCode,
    notes: data.notes,
    shippedBy: data.shippedBy,
    approveBy: data.approveBy,
    dpp: data.dpp,
    subTotal: data.subTotal,
    finalDisc: data.finalDisc,
    taxAmount: data.taxAmount,
    total: data.total,
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Delete delivery order details that not in request data item details
  const response_d = await axiosJsonServer.get(`/deliveryOrder_D?code=${data.code}`)
  const delItem = response_d.data.filter(d => !data.itemDetails.map(i => i.id).includes(d.id))
  
  for (var i = 0; i < delItem.length; i++) {
    axiosJsonServer.delete(`/deliveryOrder_D/${delItem[i].id}`)
  }

  // Update delivery order details
  for (var i = 0; i < data.itemDetails.length; i++) {
    if (data.itemDetails[i].id) {
      axiosJsonServer.put(`/deliveryOrder_D/${data.itemDetails[i].id}`, {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        itemId: data.itemDetails[i].itemId,
        itemCode: data.itemDetails[i].itemCode,
        itemName: data.itemDetails[i].itemName,
        orderQty: data.itemDetails[i].orderQty,
        qty: data.itemDetails[i].qty,
        uomId: data.itemDetails[i].uomId,
        unitId: data.itemDetails[i].unitId,
        unitName: data.itemDetails[i].unitName,
        unitPrice: data.itemDetails[i].unitPrice,
        itemSellPrice: data.itemDetails[i].itemSellPrice,
        disc: data.itemDetails[i].disc,
        nettPrice: data.itemDetails[i].nettPrice,
        total: data.itemDetails[i].total,
        // taxAmount: data.itemDetails[i].taxAmount,
        // dpp: data.itemDetails[i].dpp,
        description: data.itemDetails[i].description,
        typeId: data.itemDetails[i].typeId
      })
    } else {
      axiosJsonServer.post('/deliveryOrder_D', {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        itemId: data.itemDetails[i].itemId,
        itemCode: data.itemDetails[i].itemCode,
        itemName: data.itemDetails[i].itemName,
        orderQty: data.itemDetails[i].orderQty,
        qty: data.itemDetails[i].qty,
        uomId: data.itemDetails[i].uomId,
        unitId: data.itemDetails[i].unitId,
        unitName: data.itemDetails[i].unitName,
        unitPrice: data.itemDetails[i].unitPrice,
        itemSellPrice: data.itemDetails[i].itemSellPrice,
        disc: data.itemDetails[i].disc,
        nettPrice: data.itemDetails[i].nettPrice,
        total: data.itemDetails[i].total,
        // taxAmount: data.itemDetails[i].taxAmount,
        // dpp: data.itemDetails[i].dpp,
        description: data.itemDetails[i].description,
        typeId: data.itemDetails[i].typeId
      })
    }
  }
  
  return [200, { success: true, message: 'Success update record.' }]
})

mock.onDelete(/\/api\/delivery-order\/./).reply(async (config) => {
  const urlSegment = config.url.split('/')
  
  // Delete delivery order header
  const response_h = await axiosJsonServer.get(`/deliveryOrder_H?code=${urlSegment[urlSegment.length - 1]}`)
  if (response_h.data.length > 0) {
    axiosJsonServer.delete(`/deliveryOrder_H/${response_h.data[0].id}`)
  }

  // Delete delivery order details
  const response_d = await axiosJsonServer.get(`/deliveryOrder_D?code=${urlSegment[urlSegment.length - 1]}`)
  for (var i = 0; i < response_d.data.length; i++) {
    axiosJsonServer.delete(`/deliveryOrder_D/${response_d.data[i].id}`)
  }
  
  return [200, { success: true, message: 'Success delete record.' }]
})
