import { format } from 'date-fns'
import { orderBy as _orderBy } from 'lodash'

import endpoint from '@/configs/endpoint'
import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onGet(`/api/${endpoint.sales.invoice}`).reply(async (config) => {
  var search = null
  if (config.params) {
    var { search } = config.params
  }
  search = search || ''
  
  const resp_h = await axiosJsonServer.get(`/salesInvoice_H?q=${search}`)
  const resp_c = await axiosJsonServer.get(`/customers`)

  var results = []
  for (var i = 0; i < resp_h.data.length; i++) {
    const customer = resp_c.data.find(s => s.code == resp_h.data[i].custCode)
    
    const result = resp_h.data[i]
    result.custName = customer ? customer.name : ''
    
    results.push(result)
  }

  return [200, results]
})

mock.onGet(`/api/${endpoint.sales.invoice}/detail`).reply(async (config) => {
  const { code } = config.params
  
  const resp_d = await axiosJsonServer.get(`/salesInvoice_D?code=${code}`)
  
  var results = []
  for (var i = 0; i < resp_d.data.length; i++) {
    const result = resp_d.data[i]
    result.state = ''

    results.push(result)
  }

  return [200, results]
})

mock.onPost(`/api/${endpoint.sales.invoice}`).reply(async (request) => {
  const data = JSON.parse(request.data)
  
  const response_h = await axiosJsonServer.get('/salesInvoice_H')
  const data_h = response_h.data

  const code = data_h.length > 0
    ? `SI${(data_h[data_h.length - 1].id + 1).toString().padStart(6, '0')}`
    : 'SI000001'
  
  // Insert sales invoice header
  axiosJsonServer.post('/salesInvoice_H', {
    code: code,
    invDate: data.invDate,
    dueDate: data.dueDate,
    curr: data.curr,
    rate: data.rate,
    custCode: data.custCode,
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

  // Insert sales invoice details
  for (var i = 0; i < data.itemDetails.length; i++) {
    axiosJsonServer.post('/salesInvoice_D', {
      rowId: data.itemDetails[i].rowId,
      code: code,
      lineNo: (i + 1),
      doCode: data.itemDetails[i].doCode,
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

mock.onPut(/\/api\/sales-invoice\/./).reply(async (config) => {
  let { data } = config
  data = JSON.parse(data)
  
  const response_h = await axiosJsonServer.get(`/salesInvoice_H?code=${data.code}`)
  const id = response_h.data[0].id

  // Update sales invoice header
  axiosJsonServer.put(`/salesInvoice_H/${id}`, {
    code: data.code,
    invDate: data.invDate,
    dueDate: data.dueDate,
    curr: data.curr,
    rate: data.rate,
    custCode: data.custCode,
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

  // Delete sales invoice details that not in request data item details
  const response_d = await axiosJsonServer.get(`/salesInvoice_D?code=${data.code}`)
  const delItem = response_d.data.filter(d => !data.itemDetails.map(i => i.id).includes(d.id))
  
  for (var i = 0; i < delItem.length; i++) {
    axiosJsonServer.delete(`/salesInvoice_D/${delItem[i].id}`)
  }

  // Update sales invoice details
  for (var i = 0; i < data.itemDetails.length; i++) {
    if (data.itemDetails[i].id) {
      axiosJsonServer.put(`/salesInvoice_D/${data.itemDetails[i].id}`, {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        doCode: data.itemDetails[i].doCode,
        subTotal: data.itemDetails[i].subTotal,
        disc: data.itemDetails[i].disc,
        finalDisc: data.itemDetails[i].finalDisc,
        taxAmount: data.itemDetails[i].taxAmount,
        dpp: data.itemDetails[i].dpp,
        total: data.itemDetails[i].total
      })
    } else {
      axiosJsonServer.post('/salesInvoice_D', {
        rowId: data.itemDetails[i].rowId,
        code: data.itemDetails[i].code,
        lineNo: (i + 1),
        doCode: data.itemDetails[i].doCode,
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

mock.onDelete(/\/api\/sales-invoice\/./).reply(async (config) => {
  const urlSegment = config.url.split('/')
  
  // Delete sales invoice header
  const response_h = await axiosJsonServer.get(`/salesInvoice_H?code=${urlSegment[urlSegment.length - 1]}`)
  if (response_h.data.length > 0) {
    axiosJsonServer.delete(`/salesInvoice_H/${response_h.data[0].id}`)
  }

  // Delete sales invoice details
  const response_d = await axiosJsonServer.get(`/salesInvoice_D?code=${urlSegment[urlSegment.length - 1]}`)
  for (var i = 0; i < response_d.data.length; i++) {
    axiosJsonServer.delete(`/salesInvoice_D/${response_d.data[i].id}`)
  }
  
  return [200, { success: true, message: 'Success delete record.' }]
})
