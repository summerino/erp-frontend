import { format } from 'date-fns'
import { orderBy as _orderBy } from 'lodash'

import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.purchase.invoice}`).reply(async (config) => {
  var searchBy = ''
  var searchOp = ''
  var search = ''
  if (config.params) {
    var { searchBy, searchOp, search } = config.params
  }
  searchBy = searchBy ? searchBy.toLowerCase() : ''
  searchOp = searchOp ? searchOp.toLowerCase() : ''
  search = search ? search.toLowerCase() : ''

  var param = ''
  if (!searchBy) {
    param = !searchBy ? `?q=${search}` : ''
  }

  const resp_h = await axiosJsonServer.get(`/purchaseInvoice_H${param}`)
  const resp_s = await axiosJsonServer.get(`/suppliers`)

  var results = resp_h.data.filter(r => {
    if (searchBy == 'date' && searchOp == 'neq') return r.invDate != search
    else if (searchBy == 'date') return r.invDate == search
    else if (searchBy == 'code' && searchOp == 'contains') return r.code.toLowerCase().includes(search)
    else if (searchBy == 'code' && searchOp == 'neq') return r.code.toLowerCase() != search
    else if (searchBy == 'code') return r.code.toLowerCase() == search
    else return r
  })

  for (var i = 0; i < results.length; i++) {
    const supplier = resp_s.data.find(s => s.code == results[i].supCode)
    results[i].supName = supplier ? supplier.name : ''
  }

  results = results.filter(r => {
    if (searchBy == 'supname' && searchOp == 'contains') return r.supName.toLowerCase().includes(search)
    else if (searchBy == 'supname' && searchOp == 'neq') return r.supName.toLowerCase() != search
    else if (searchBy == 'supname') return r.supName.toLowerCase() == search
    else return r
  })

  return [200, results]
})

mock.onGet(`/api/${endpoint.purchase.invoice}/detail`).reply(async (config) => {
  const { code } = config.params
  
  const resp_d = await axiosJsonServer.get(`/purchaseInvoice_D?code=${code}`)
  
  var results = []
  for (var i = 0; i < resp_d.data.length; i++) {
    const result = resp_d.data[i]
    result.state = ''

    results.push(result)
  }

  return [200, results]
})

mock.onGet(`/api/${endpoint.purchase.invoice}/item`).reply(async (config) => {
  var code = ''
  var searchBy = ''
  var searchOp = ''
  var search = ''
  var { code, searchBy, searchOp, search } = config.params
  
  searchBy = searchBy ? searchBy.toLowerCase() : ''
  searchOp = searchOp ? searchOp.toLowerCase() : ''
  search = search ? search.toLowerCase() : ''

  const resp_d = await axiosJsonServer.get(`/purchaseInvoice_D?code=${code}`)
  
  var results = []
  for (var i = 0; i < resp_d.data.length; i++) {
    const resp_pr_d = await axiosJsonServer.get(`/purchaseReceive_D?code=${resp_d.data[i].rcvCode}`)
    for (var j = 0; j < resp_pr_d.data.length; j++) {
      results.push({
        id: resp_pr_d.data[j].itemId,
        code: resp_pr_d.data[j].itemCode,
        name: resp_pr_d.data[j].itemName,
        warehouseCode: resp_pr_d.data[j].warehouseCode,
        qty: resp_pr_d.data[j].qty,
        availableQty: resp_pr_d.data[j].qty,
        uomId: resp_pr_d.data[j].uomId,
        uomBuyId: resp_pr_d.data[j].unitId,
        uomBuyName: resp_pr_d.data[j].unitName,
        unitPrice: resp_pr_d.data[j].unitPrice,
        disc: resp_pr_d.data[j].disc,
        nettPrice: resp_pr_d.data[j].nettPrice,
        total: resp_pr_d.data[j].total
      })
    }
  }

  results = results.filter(r => {
    if (searchBy == 'code' && searchOp == 'contains') return r.code.toLowerCase().includes(search)
    else if (searchBy == 'code' && searchOp == 'neq') return r.code.toLowerCase() != search
    else if (searchBy == 'code') return r.code.toLowerCase() == search
    else if (searchBy == 'name' && searchOp == 'contains') return r.name.toLowerCase().includes(search)
    else if (searchBy == 'name' && searchOp == 'neq') return r.name.toLowerCase() != search
    else if (searchBy == 'name') return r.name.toLowerCase() == search
    else if (searchBy == 'unit' && searchOp == 'contains') return r.uomBuyName.toLowerCase().includes(search)
    else if (searchBy == 'unit' && searchOp == 'neq') return r.uomBuyName.toLowerCase() != search
    else if (searchBy == 'unit') return r.uomBuyName.toLowerCase() == search
    else return r
  })

  return [200, results]
})

mock.onPost(`/api/${endpoint.purchase.invoice}`).reply(async (request) => {
  const data = JSON.parse(request.data)
  
  const response_h = await axiosJsonServer.get('/purchaseInvoice_H')
  const data_h = response_h.data

  const code = data_h.length > 0
    ? `PI${(data_h[data_h.length - 1].id + 1).toString().padStart(6, '0')}`
    : 'PI000001'
  
  // Insert purchase invoice header
  axiosJsonServer.post('/purchaseInvoice_H', {
    code: code,
    invDate: data.invDate,
    dueDate: data.dueDate,
    curr: data.curr,
    rate: data.rate,
    supCode: data.supCode,
    tax: data.tax,
    includeTax: data.includeTax,
    notes: data.notes,
    // downPayment: data.downPayment,
    // applyTax: data.applyTax,
    // dpTax: data.dpTax,
    shipmentFee: data.shipmentFee,
    handlingFee: data.handlingFee,
    subTotal: data.subTotal,
    finalDiscPercent: data.finalDiscPercent,
    finalDisc: data.finalDisc,
    taxPercent: data.taxPercent,
    taxAmount: data.taxAmount,
    dpp: data.dpp,
    total: data.total,
    createdBy: data.createdBy,
    createdDate: format(new Date(), 'yyyy-MM-dd'),
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Insert purchase invoice details
  for (var i = 0; i < data.itemDetails.length; i++) {
    axiosJsonServer.post('/purchaseInvoice_D', {
      rowId: data.itemDetails[i].rowId,
      code: code,
      lineNo: (i + 1),
      rcvCode: data.itemDetails[i].rcvCode,
      subTotal: data.itemDetails[i].subTotal,
      disc: data.itemDetails[i].disc,
      finalDisc: data.itemDetails[i].finalDisc,
      taxAmount: data.itemDetails[i].taxAmount,
      dpp: data.itemDetails[i].dpp,
      total: data.itemDetails[i].total
    })
  }

  return [200, { success: true, message: 'Success insert record.' }]
})

mock.onPut(/\/api\/purchase-invoice\/./).reply(async (config) => {
  let { data } = config
  data = JSON.parse(data)
  
  const response_h = await axiosJsonServer.get(`/purchaseInvoice_H?code=${data.code}`)
  const id = response_h.data[0].id

  // Update purchase invoice header
  axiosJsonServer.put(`/purchaseInvoice_H/${id}`, {
    code: data.code,
    invDate: data.invDate,
    dueDate: data.dueDate,
    curr: data.curr,
    rate: data.rate,
    supCode: data.supCode,
    tax: data.tax,
    includeTax: data.includeTax,
    notes: data.notes,
    // downPayment: data.downPayment,
    // applyTax: data.applyTax,
    // dpTax: data.dpTax,
    shipmentFee: data.shipmentFee,
    handlingFee: data.handlingFee,
    subTotal: data.subTotal,
    finalDiscPercent: data.finalDiscPercent,
    finalDisc: data.finalDisc,
    taxPercent: data.taxPercent,
    taxAmount: data.taxAmount,
    dpp: data.dpp,
    total: data.total,
    updatedBy: data.updatedBy,
    updatedDate: format(new Date(), 'yyyy-MM-dd')
  })

  // Delete purchase invoice details that not in request data item details
  const response_d = await axiosJsonServer.get(`/purchaseInvoice_D?code=${data.code}`)
  const delItem = response_d.data.filter(d => !data.itemDetails.map(i => i.id).includes(d.id))
  
  for (var i = 0; i < delItem.length; i++) {
    axiosJsonServer.delete(`/purchaseInvoice_D/${delItem[i].id}`)
  }

  // Update purchase invoice details
  for (var i = 0; i < data.itemDetails.length; i++) {
    if (data.itemDetails[i].id) {
      axiosJsonServer.put(`/purchaseInvoice_D/${data.itemDetails[i].id}`, {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        rcvCode: data.itemDetails[i].rcvCode,
        subTotal: data.itemDetails[i].subTotal,
        disc: data.itemDetails[i].disc,
        finalDisc: data.itemDetails[i].finalDisc,
        taxAmount: data.itemDetails[i].taxAmount,
        dpp: data.itemDetails[i].dpp,
        total: data.itemDetails[i].total
      })
    } else {
      axiosJsonServer.post('/purchaseInvoice_D', {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        rcvCode: data.itemDetails[i].rcvCode,
        subTotal: data.itemDetails[i].subTotal,
        disc: data.itemDetails[i].disc,
        finalDisc: data.itemDetails[i].finalDisc,
        taxAmount: data.itemDetails[i].taxAmount,
        dpp: data.itemDetails[i].dpp,
        total: data.itemDetails[i].total
      })
    }
  }
  
  return [200, { success: true, message: 'Success update record.' }]
})

mock.onDelete(/\/api\/purchase-invoice\/./).reply(async (config) => {
  const urlSegment = config.url.split('/')
  
  // Delete purchase invoice header
  const response_h = await axiosJsonServer.get(`/purchaseInvoice_H?code=${urlSegment[urlSegment.length - 1]}`)
  if (response_h.data.length > 0) {
    axiosJsonServer.delete(`/purchaseInvoice_H/${response_h.data[0].id}`)
  }

  // Delete purchase invoice details
  const response_d = await axiosJsonServer.get(`/purchaseInvoice_D?code=${urlSegment[urlSegment.length - 1]}`)
  for (var i = 0; i < response_d.data.length; i++) {
    axiosJsonServer.delete(`/purchaseInvoice_D/${response_d.data[i].id}`)
  }
  
  return [200, { success: true, message: 'Success delete record.' }]
})
