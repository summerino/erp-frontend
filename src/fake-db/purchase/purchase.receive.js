import { format } from 'date-fns'

import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.purchase.receive}`).reply(async (config) => {
  var search = null
  if (config.params) {
    var { search } = config.params
  }
  search = search || ''
  
  const resp_h = await axiosJsonServer.get(`/purchaseReceive_H?q=${search}`)
  const resp_s = await axiosJsonServer.get(`/suppliers`)
  
  var results = []
  for (var i = 0; i < resp_h.data.length; i++) {
    const result = resp_h.data[i]
    result.supName = resp_s.data.find(s => s.code == resp_h.data[i].supCode).name
    
    results.push(result)
  }
  
  return [200, results]
})

mock.onGet(`/api/${endpoint.purchase.receive}/item`).reply(async (config) => {
  const { code } = config.params
  
  const resp_d = await axiosJsonServer.get(`/purchaseReceive_D?code=${code}&_sort=lineNo`)
  const resp_uc = await axiosJsonServer.get(`/uomConversions`)

  var results = []
  for (var i = 0; i < resp_d.data.length; i++) {
    const result = resp_d.data[i]
    result.unitName = resp_uc.data.find(uc => uc.id == result.unitId).unitEquivalent
    result.typeName = result.typeId == 0 ? 'Normal' : 'Bonus'
    
    results.push(result)
  }

  return [200, results]
})

mock.onGet(/\/api\/purchase-receive\/uninv\/./).reply(async (config) => {
  const urlSegment = config.url.split('/')
  var searchBy = ''
  var search = ''

  if (config.params) {
    var { searchBy, search } = config.params
  }
  searchBy = searchBy.toLowerCase()
  search = search.toLowerCase()
  
  const resp_h = await axiosJsonServer.get(`/purchaseReceive_H?supCode=${urlSegment[urlSegment.length - 1]}`)
  
  let results = resp_h.data.filter(h => {
    if (searchBy == 'code') return h.code.toLowerCase().includes(search)
    else if (searchBy == 'pocode') return h.poCode.toLowerCase().includes(search)
    else if (searchBy == 'refno') return h.refNo.toLowerCase().includes(search)
    else return h
  })

  return [200, results]
})

mock.onPost(`/api/${endpoint.purchase.receive}`).reply(async (request) => {
  const data = JSON.parse(request.data)
  
  const response_h = await axiosJsonServer.get('/purchaseReceive_H')
  const data_h = response_h.data

  const code = data_h.length > 0
    ? `RCV${(data_h[data_h.length - 1].id + 1).toString().padStart(6, '0')}`
    : 'RCV000001'
  
  // Insert purchase receive header
  axiosJsonServer.post('/purchaseReceive_H', {
    code: code,
    refNo: data.refNo,
    receiveDate: data.receiveDate,
    poCode: data.poCode,
    supCode: data.supCode,
    receiveBy: data.receiveBy,
    approveBy: data.approveBy,
    subTotal: data.subTotal,
    finalDisc: data.finalDisc,
    taxAmount: data.taxAmount,
    dpp: data.dpp,
    total: data.total,
    createdBy: data.createdBy,
    createdDate: format(new Date(), 'yyyy-MM-dd'),
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Insert purchase receive details
  for (var i = 0; i < data.itemDetails.length; i++) {
    axiosJsonServer.post('/purchaseReceive_D', {
      rowId: data.itemDetails[i].rowId,
      code: code,
      lineNo: (i + 1),
      itemId: data.itemDetails[i].itemId,
      itemCode: data.itemDetails[i].itemCode,
      itemName: data.itemDetails[i].itemName,
      orderQty: data.itemDetails[i].orderQty,
      outstandingQty: data.itemDetails[i].outstandingQty,
      qty: data.itemDetails[i].qty,
      uomId: data.itemDetails[i].uomId,
      unitId: data.itemDetails[i].unitId,
      unitName: data.itemDetails[i].unitName,
      unitPrice: data.itemDetails[i].unitPrice,
      itemBuyPrice: data.itemDetails[i].itemBuyPrice,
      disc: data.itemDetails[i].disc,
      nettPrice: data.itemDetails[i].nettPrice,
      total: data.itemDetails[i].total,
      warehouseCode: data.itemDetails[i].warehouseCode,
      warehouseInitial: data.itemDetails[i].warehouseInitial,
      warehouseName: data.itemDetails[i].warehouseName,
      typeId: data.itemDetails[i].typeId
    })
  }

  return [200, { success: true, message: 'Success insert record.' }]
})

mock.onPut(/\/api\/purchase-receive\/./).reply(async (config) => {
  let { data } = config
  data = JSON.parse(data)
  
  const response_h = await axiosJsonServer.get(`/purchaseReceive_H?code=${data.code}`)
  const id = response_h.data[0].id

  // Update purchase receive header
  axiosJsonServer.put(`/purchaseReceive_H/${id}`, {
    code: data.code,
    refNo: data.refNo,
    receiveDate: data.receiveDate,
    poCode: data.poCode,
    supCode: data.supCode,
    receiveBy: data.receiveBy,
    approveBy: data.approveBy,
    subTotal: data.subTotal,
    finalDisc: data.finalDisc,
    taxAmount: data.taxAmount,
    dpp: data.dpp,
    total: data.total,
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Delete purchase receive details that not in request data item details
  const response_d = await axiosJsonServer.get(`/purchaseReceive_D?code=${data.code}`)
  const delItem = response_d.data.filter(d => !data.itemDetails.map(i => i.id).includes(d.id))
  
  for (var i = 0; i < delItem.length; i++) {
    axiosJsonServer.delete(`/purchaseReceive_D/${delItem[i].id}`)
  }

  // Update purchase receive details
  for (var i = 0; i < data.itemDetails.length; i++) {
    if (data.itemDetails[i].id) {
      axiosJsonServer.put(`/purchaseReceive_D/${data.itemDetails[i].id}`, {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        itemId: data.itemDetails[i].itemId,
        itemCode: data.itemDetails[i].itemCode,
        itemName: data.itemDetails[i].itemName,
        orderQty: data.itemDetails[i].orderQty,
        outstandingQty: data.itemDetails[i].outstandingQty,
        qty: data.itemDetails[i].qty,
        uomId: data.itemDetails[i].uomId,
        unitId: data.itemDetails[i].unitId,
        unitName: data.itemDetails[i].unitName,
        unitPrice: data.itemDetails[i].unitPrice,
        itemBuyPrice: data.itemDetails[i].itemBuyPrice,
        disc: data.itemDetails[i].disc,
        nettPrice: data.itemDetails[i].nettPrice,
        total: data.itemDetails[i].total,
        warehouseCode: data.itemDetails[i].warehouseCode,
        warehouseInitial: data.itemDetails[i].warehouseInitial,
        warehouseName: data.itemDetails[i].warehouseName,
        typeId: data.itemDetails[i].typeId
      })
    } else {
      axiosJsonServer.post('/purchaseReceive_D', {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        itemId: data.itemDetails[i].itemId,
        itemCode: data.itemDetails[i].itemCode,
        itemName: data.itemDetails[i].itemName,
        orderQty: data.itemDetails[i].orderQty,
        outstandingQty: data.itemDetails[i].outstandingQty,
        qty: data.itemDetails[i].qty,
        uomId: data.itemDetails[i].uomId,
        unitId: data.itemDetails[i].unitId,
        unitName: data.itemDetails[i].unitName,
        unitPrice: data.itemDetails[i].unitPrice,
        itemBuyPrice: data.itemDetails[i].itemBuyPrice,
        disc: data.itemDetails[i].disc,
        nettPrice: data.itemDetails[i].nettPrice,
        total: data.itemDetails[i].total,
        warehouseCode: data.itemDetails[i].warehouseCode,
        warehouseInitial: data.itemDetails[i].warehouseInitial,
        warehouseName: data.itemDetails[i].warehouseName,
        typeId: data.itemDetails[i].typeId
      })
    }
  }
  
  return [200, { success: true, message: 'Success update record.' }]
})

mock.onDelete(/\/api\/purchase-receive\/./).reply(async (config) => {
  const urlSegment = config.url.split('/')
  
  // Delete purchase receive header
  const response_h = await axiosJsonServer.get(`/purchaseReceive_H?code=${urlSegment[urlSegment.length - 1]}`)
  if (response_h.data.length > 0) {
    axiosJsonServer.delete(`/purchaseReceive_H/${response_h.data[0].id}`)
  }

  // Delete purchase receive details
  const response_d = await axiosJsonServer.get(`/purchaseReceive_D?code=${urlSegment[urlSegment.length - 1]}`)
  for (var i = 0; i < response_d.data.length; i++) {
    axiosJsonServer.delete(`/purchaseReceive_D/${response_d.data[i].id}`)
  }
  
  return [200, { success: true, message: 'Success delete record.' }]
})
