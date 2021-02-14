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
  
  const response = await axiosJsonServer.get(`/purchaseReceive_H?q=${search}`)

  return [response.status, response.data]
})

mock.onGet(`/api/${endpoint.purchase.receive}/item`).reply(async (config) => {
  const { code } = config.params
  
  const response = await axiosJsonServer.get(`/purchaseReceive_D?code=${code}`)

  return [response.status, response.data]
})

mock.onPost(`/api/${endpoint.purchase.receive}`).reply(async (request) => {
  const data = JSON.parse(request.data)
  
  const response_h = await axiosJsonServer.get('/purchaseReceive_H')
  const data_h = response_h.data

  const code = data_h.length > 0
    ? `RCV${(data_h[data_h.length - 1].id + 1).toString().padStart(5, '0')}`
    : 'RCV000001'
  
  // Insert purchase receive header
  axiosJsonServer.post('/purchaseReceive_H', {
    code: code,
    receiveDate: data.receiveDate,
    supDocNo: data.supDocNo,
    supCode: data.supCode,
    receiveBy: data.receiveBy,
    approveBy: data.approveBy,
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
      warehouseCode: data.itemDetails[i].warehouseCode,
      warehouseInitial: data.itemDetails[i].warehouseInitial,
      warehouseName: data.itemDetails[i].warehouseName
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
    receiveDate: data.receiveDate,
    supDocNo: data.supDocNo,
    supCode: data.supCode,
    receiveBy: data.receiveBy,
    approveBy: data.approveBy,
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
        warehouseCode: data.itemDetails[i].warehouseCode,
        warehouseInitial: data.itemDetails[i].warehouseInitial,
        warehouseName: data.itemDetails[i].warehouseName
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
        warehouseCode: data.itemDetails[i].warehouseCode,
        warehouseInitial: data.itemDetails[i].warehouseInitial,
        warehouseName: data.itemDetails[i].warehouseName
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
