import { format } from 'date-fns'
import { orderBy as _orderBy } from 'lodash'

import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.sales.order}`).reply(async (config) => {
  var search = null
  if (config.params) {
    var { search } = config.params
  }
  search = search || ''

  const resp_h = await axiosJsonServer.get(`/salesOrder_H?q=${search}`)
  const resp_s = await axiosJsonServer.get(`/salesmans`)
  const resp_c = await axiosJsonServer.get(`/customers`)

  var results = []
  for (var i = 0; i < resp_h.data.length; i++) {
    const salesman = resp_s.data.find(s => s.code == resp_h.data[i].salesCode)
    const cust = resp_c.data.find(c => c.code == resp_h.data[i].custCode)
    
    const result = resp_h.data[i]
    result.salesName = salesman ? salesman.name : ''
    result.custName = cust ? cust.name: ''
    
    results.push(result)
  }

  return [200, results]
})

mock.onGet(`/api/${endpoint.sales.order}/item`).reply(async (config) => {
  const { code } = config.params
  
  const resp_d = await axiosJsonServer.get(`/salesOrder_D?code=${code}`)
  const resp_uc = await axiosJsonServer.get(`/uomConversions`)

  var results = []
  for (var i = 0; i < resp_d.data.length; i++) {
    const result = resp_d.data[i]
    result.units = _orderBy(resp_uc.data.filter(uc => uc.uomId == result.uomId), 'seq')
    result.state = ''

    results.push(result)
  }

  return [200, results]
})

mock.onGet(`/api/${endpoint.sales.order}/incomplete`).reply(async (config) => {
  var searchBy = ''
  var search = ''
  var results = []

  if (config.params) {
    var { searchBy, search } = config.params
  }
  searchBy = searchBy.toLowerCase()
  search = search.toLowerCase()
  
  const resp_h = await axiosJsonServer.get(`/salesOrder_H`)
  
  let result_h = resp_h.data.filter(h => {
    if (searchBy == 'socode_eq') return h.code.toLowerCase() == search
    else if (searchBy == 'socode_contains') return h.code.toLowerCase().includes(search)
    else if (searchBy == 'curr') return h.curr.toLowerCase().includes(search)
    else return h
  })

  if (result_h.length > 0) {
    const resp_s = await axiosJsonServer.get(`/salesmans`)
    const resp_c = await axiosJsonServer.get(`/customers`)

    for (var i = 0; i < result_h.length; i++) {
      const result = result_h[i]
      result.salesName = resp_s.data.find(s => s.code == result_h[i].salesCode).name

      const cust = resp_c.data.find(c => c.code == result_h[i].custCode)
      result.custName = cust.name
      result.custAddr = cust.address
      result.custPhone = cust.phone1
      result.custFax = cust.fax

      results.push(result)
    }
    
    results = results.filter(r => {
      if (searchBy == 'custname') return r.custName.toLowerCase().includes(search)
      else return r
    })
  }

  return [200, results]
})

mock.onGet(`/api/${endpoint.sales.order}/outstanding-item`).reply(async (config) => {
  const { code } = config.params
  
  const response = await axiosJsonServer.get(`/salesOrder_D?code=${code}`)

  var results = []
  for (var i = 0; i < response.data.length; i++) {
    const result = response.data[i]
    result.orderQty = result.qty
    result.outstandingQty = result.qty
    result.qty = result.qty
    result.description = null
    result.typeId = 0
    result.typeName = 'Normal'
    results.push(result)
  }

  return [200, results]
})

mock.onPost(`/api/${endpoint.sales.order}`).reply(async (request) => {
  const data = JSON.parse(request.data)
  
  const response_h = await axiosJsonServer.get('/salesOrder_H')
  const data_h = response_h.data

  const code = data_h.length > 0
    ? `SO${(data_h[data_h.length - 1].id + 1).toString().padStart(6, '0')}`
    : 'SO000001'
  
  // Insert sales order header
  axiosJsonServer.post('/salesOrder_H', {
    code: code,
    orderDate: data.orderDate,
    salesCode: data.salesCode,
    curr: data.curr,
    rate: data.rate,
    includeTax: data.includeTax,
    custCode: data.custCode,
    deliveryDate: data.deliveryDate,
    billAddr: data.billAddr,
    top: data.top,
    tax: data.tax,
    downPayment: data.downPayment,
    applyTax: data.applyTax,
    notes: data.notes,
    dpTax: data.dpTax,
    shipmentFee: data.shipmentFee,
    handlingFee: data.handlingFee,
    dpp: data.dpp,
    subTotal: data.subTotal,
    finalDiscPercent: data.finalDiscPercent,
    finalDisc: data.finalDisc,
    taxPercent: data.taxPercent,
    taxAmount: data.taxAmount,
    total: data.total,
    createdBy: data.createdBy,
    createdDate: format(new Date(), 'yyyy-MM-dd'),
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Insert sales order details
  for (var i = 0; i < data.itemDetails.length; i++) {
    axiosJsonServer.post('/salesOrder_D', {
      rowId: data.itemDetails[i].rowId,
      code: code,
      lineNo: (i + 1),
      itemId: data.itemDetails[i].itemId,
      itemCode: data.itemDetails[i].itemCode,
      itemName: data.itemDetails[i].itemName,
      qty: data.itemDetails[i].qty,
      uomId: data.itemDetails[i].uomId,
      unitId: data.itemDetails[i].unitId,
      unitName: data.itemDetails[i].unitName,
      uomSellName: data.itemDetails[i].uomSellName,
      unitPrice: data.itemDetails[i].unitPrice,
      itemSellPrice: data.itemDetails[i].itemSellPrice,
      disc: data.itemDetails[i].disc,
      nettPrice: data.itemDetails[i].nettPrice,
      total: data.itemDetails[i].total,
      // taxAmount: data.itemDetails[i].taxAmount,
      // dpp: data.itemDetails[i].dpp,
      description: data.itemDetails[i].description
    })
  }

  return [200, { success: true, message: 'Success insert record.' }]
})

mock.onPut(/\/api\/sales-order\/./).reply(async (config) => {
  let { data } = config
  data = JSON.parse(data)
  
  const response_h = await axiosJsonServer.get(`/salesOrder_H?code=${data.code}`)
  const id = response_h.data[0].id

  // Update sales order header
  axiosJsonServer.put(`/salesOrder_H/${id}`, {
    code: data.code,
    orderDate: data.orderDate,
    salesCode: data.salesCode,
    curr: data.curr,
    rate: data.rate,
    includeTax: data.includeTax,
    custCode: data.custCode,
    deliveryDate: data.deliveryDate,
    billAddr: data.billAddr,
    top: data.top,
    tax: data.tax,
    downPayment: data.downPayment,
    applyTax: data.applyTax,
    notes: data.notes,
    dpTax: data.dpTax,
    shipmentFee: data.shipmentFee,
    handlingFee: data.handlingFee,
    dpp: data.dpp,
    subTotal: data.subTotal,
    finalDiscPercent: data.finalDiscPercent,
    finalDisc: data.finalDisc,
    taxPercent: data.taxPercent,
    taxAmount: data.taxAmount,
    total: data.total,
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Delete sales order details that not in request data item details
  const response_d = await axiosJsonServer.get(`/salesOrder_D?code=${data.code}`)
  const delItem = response_d.data.filter(d => !data.itemDetails.map(i => i.id).includes(d.id))
  
  for (var i = 0; i < delItem.length; i++) {
    axiosJsonServer.delete(`/salesOrder_D/${delItem[i].id}`)
  }

  // Update sales order details
  for (var i = 0; i < data.itemDetails.length; i++) {
    if (data.itemDetails[i].id) {
      axiosJsonServer.put(`/salesOrder_D/${data.itemDetails[i].id}`, {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        itemId: data.itemDetails[i].itemId,
        itemCode: data.itemDetails[i].itemCode,
        itemName: data.itemDetails[i].itemName,
        qty: data.itemDetails[i].qty,
        uomId: data.itemDetails[i].uomId,
        unitId: data.itemDetails[i].unitId,
        unitName: data.itemDetails[i].unitName,
        uomSellName: data.itemDetails[i].uomSellName,
        unitPrice: data.itemDetails[i].unitPrice,
        itemSellPrice: data.itemDetails[i].itemSellPrice,
        disc: data.itemDetails[i].disc,
        nettPrice: data.itemDetails[i].nettPrice,
        total: data.itemDetails[i].total,
        // taxAmount: data.itemDetails[i].taxAmount,
        // dpp: data.itemDetails[i].dpp,
        description: data.itemDetails[i].description
      })
    } else {
      axiosJsonServer.post('/salesOrder_D', {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        itemId: data.itemDetails[i].itemId,
        itemCode: data.itemDetails[i].itemCode,
        itemName: data.itemDetails[i].itemName,
        qty: data.itemDetails[i].qty,
        uomId: data.itemDetails[i].uomId,
        unitId: data.itemDetails[i].unitId,
        unitName: data.itemDetails[i].unitName,
        uomSellName: data.itemDetails[i].uomSellName,
        unitPrice: data.itemDetails[i].unitPrice,
        itemSellPrice: data.itemDetails[i].itemSellPrice,
        disc: data.itemDetails[i].disc,
        nettPrice: data.itemDetails[i].nettPrice,
        total: data.itemDetails[i].total,
        // taxAmount: data.itemDetails[i].taxAmount,
        // dpp: data.itemDetails[i].dpp,
        description: data.itemDetails[i].description
      })
    }
  }
  
  return [200, { success: true, message: 'Success update record.' }]
})

mock.onDelete(/\/api\/sales-order\/./).reply(async (config) => {
  const urlSegment = config.url.split('/')
  
  // Delete sales order header
  const response_h = await axiosJsonServer.get(`/salesOrder_H?code=${urlSegment[urlSegment.length - 1]}`)
  if (response_h.data.length > 0) {
    axiosJsonServer.delete(`/salesOrder_H/${response_h.data[0].id}`)
  }

  // Delete sales order details
  const response_d = await axiosJsonServer.get(`/salesOrder_D?code=${urlSegment[urlSegment.length - 1]}`)
  for (var i = 0; i < response_d.data.length; i++) {
    axiosJsonServer.delete(`/salesOrder_D/${response_d.data[i].id}`)
  }
  
  return [200, { success: true, message: 'Success delete record.' }]
})
