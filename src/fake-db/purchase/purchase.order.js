import { format } from 'date-fns'

import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.purchase.order}`).reply(async (config) => {
  var search = null
  if (config.params) {
    var { search } = config.params
  }
  search = search || ''
  
  const response = await axiosJsonServer.get(`/purchaseOrder_H?q=${search}`)

  return [response.status, response.data]
})

mock.onGet(`/api/${endpoint.purchase.order}/item`).reply(async (config) => {
  const { code } = config.params
  
  const response = await axiosJsonServer.get(`/purchaseOrder_D?code=${code}`)

  return [response.status, response.data]
})

mock.onGet(`/api/${endpoint.purchase.order}/incomplete`).reply(async (config) => {
  var supCode = ''
  var searchBy = ''
  var search = ''
  var results = []

  if (config.params) {
    var { supCode, searchBy, search } = config.params
  }
  searchBy = searchBy.toLowerCase()
  search = search.toLowerCase()
  
  const resp_h = await axiosJsonServer.get(`/purchaseOrder_H?supCode=${supCode}`)
  
  let result_h = resp_h.data.filter(h => {
    if (searchBy == 'pocode') return h.code.toLowerCase().includes(search)
    else return h
  })

  if (result_h.length > 0) {
    var params = ''
    for (var i = 0; i < result_h.length; i++) {
      params += `&code=${result_h[i].code}`
    }
    params = `?${params.substring(1)}`

    const resp_d = await axiosJsonServer.get(`/purchaseOrder_D${params}`)

    const result_d = resp_d.data.filter(d => {
      if (searchBy == 'itemcode') return d.itemCode.toLowerCase().includes(search)
      else return d.itemName.toLowerCase().includes(search)
    })

    const resp_w = await axiosJsonServer.get(`/warehouses`)
    const result_w = resp_w.data

    for (var j = 0; j < result_d.length; j++) {
      const result = {
        poCode: result_d[j].code,
        poDate: result_h.find(x => x.code == result_d[j].code).orderDate,
        warehouseCode: result_h.find(x => x.code == result_d[j].code).warehouseCode,
        itemCode: result_d[j].itemCode,
        itemName: result_d[j].itemName,
        qty: result_d[j].qty,
        uomId: result_d[j].uomId,
        unitId: result_d[j].unitId,
        unitName: result_d[j].unitName,
        uomBuyName: result_d[j].uomBuyName,
        itemBuyPrice: result_d[j].itemBuyPrice,
        disc: result_d[j].disc,
        nettPrice: result_d[j].nettPrice,
        total: result_d[j].total
      }
      result.warehouseInitial = result_w.find(x => x.code == result.warehouseCode).initial
      result.warehouseName = result_w.find(x => x.code == result.warehouseCode).name
      results.push(result)
    }
  }
  
  return [200, results]
})

mock.onPost(`/api/${endpoint.purchase.order}`).reply(async (request) => {
  const data = JSON.parse(request.data)
  
  const response_h = await axiosJsonServer.get('/purchaseOrder_H')
  const data_h = response_h.data

  const code = data_h.length > 0
    ? `PO${(data_h[data_h.length - 1].id + 1).toString().padStart(5, '0')}`
    : 'PO000001'
  
  // Insert purchase order header
  axiosJsonServer.post('/purchaseOrder_H', {
    code: code,
    orderDate: data.orderDate,
    workerCode: data.workerCode,
    curr: data.curr,
    rate: data.rate,
    includeTax: data.includeTax,
    supCode: data.supCode,
    warehouseCode: data.warehouseCode,
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
    grandTotal: data.grandTotal,
    createdBy: data.createdBy,
    createdDate: format(new Date(), 'yyyy-MM-dd'),
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Insert purchase order details
  for (var i = 0; i < data.itemDetails.length; i++) {
    axiosJsonServer.post('/purchaseOrder_D', {
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
      uomBuyName: data.itemDetails[i].uomBuyName,
      unitPrice: data.itemDetails[i].unitPrice,
      itemBuyPrice: data.itemDetails[i].itemBuyPrice,
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

mock.onPut(/\/api\/purchase-order\/./).reply(async (config) => {
  let { data } = config
  data = JSON.parse(data)
  
  const response_h = await axiosJsonServer.get(`/purchaseOrder_H?code=${data.code}`)
  const id = response_h.data[0].id

  // Update purchase order header
  axiosJsonServer.put(`/purchaseOrder_H/${id}`, {
    code: data.code,
    orderDate: data.orderDate,
    workerCode: data.workerCode,
    curr: data.curr,
    rate: data.rate,
    includeTax: data.includeTax,
    supCode: data.supCode,
    warehouseCode: data.warehouseCode,
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
    grandTotal: data.grandTotal,
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Delete purchase order details that not in request data item details
  const response_d = await axiosJsonServer.get(`/purchaseOrder_D?code=${data.code}`)
  const delItem = response_d.data.filter(d => !data.itemDetails.map(i => i.id).includes(d.id))
  
  for (var i = 0; i < delItem.length; i++) {
    axiosJsonServer.delete(`/purchaseOrder_D/${delItem[i].id}`)
  }

  // Update purchase order details
  for (var i = 0; i < data.itemDetails.length; i++) {
    if (data.itemDetails[i].id) {
      axiosJsonServer.put(`/purchaseOrder_D/${data.itemDetails[i].id}`, {
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
        uomBuyName: data.itemDetails[i].uomBuyName,
        unitPrice: data.itemDetails[i].unitPrice,
        itemBuyPrice: data.itemDetails[i].itemBuyPrice,
        disc: data.itemDetails[i].disc,
        nettPrice: data.itemDetails[i].nettPrice,
        total: data.itemDetails[i].total,
        // taxAmount: data.itemDetails[i].taxAmount,
        // dpp: data.itemDetails[i].dpp,
        description: data.itemDetails[i].description
      })
    } else {
      axiosJsonServer.post('/purchaseOrder_D', {
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
        uomBuyName: data.itemDetails[i].uomBuyName,
        unitPrice: data.itemDetails[i].unitPrice,
        itemBuyPrice: data.itemDetails[i].itemBuyPrice,
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

mock.onDelete(/\/api\/purchase-order\/./).reply(async (config) => {
  const urlSegment = config.url.split('/')
  
  // Delete purchase order header
  const response_h = await axiosJsonServer.get(`/purchaseOrder_H?code=${urlSegment[urlSegment.length - 1]}`)
  if (response_h.data.length > 0) {
    axiosJsonServer.delete(`/purchaseOrder_H/${response_h.data[0].id}`)
  }

  // Delete purchase order details
  const response_d = await axiosJsonServer.get(`/purchaseOrder_D?code=${urlSegment[urlSegment.length - 1]}`)
  for (var i = 0; i < response_d.data.length; i++) {
    axiosJsonServer.delete(`/purchaseOrder_D/${response_d.data[i].id}`)
  }
  
  return [200, { success: true, message: 'Success delete record.' }]
})
