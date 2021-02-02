import mock from '@/fake-db/mock.js'
import axiosJsonServer from '@/axios.jsonserver'

mock.onPost('/api/sales-order/list').reply(async (request) => {
  // const { src } = JSON.parse(request.data)
  
  const response = await axiosJsonServer.get('/salesOrder_H')

  return [response.status, response.data]
})

mock.onPost('/api/sales-order/item/list').reply(async (request) => {
  const { code } = JSON.parse(request.data)
  
  const response = await axiosJsonServer.get(`/salesOrder_D?code=${code}`)

  return [response.status, response.data]
})

mock.onPost('/api/sales-order/update').reply(async (request) => {
  const req = JSON.parse(request.data)
  
  console.log(req)

  let result = {
    success: false,
    message: null
  }

  if (req.action.toLowerCase() == 'add') {
    const response_h = await axiosJsonServer.get('/salesOrder_H')
    const data_h = response_h.data

    const code = data_h.length > 0
      ? `SO${(data_h[data_h.length - 1].id + 1).toString().padStart(5, '0')}`
      : 'SO000001'
    
    // Insert header
    axiosJsonServer.post('/salesOrder_H', {
      code: code,
      orderDate: req.orderDate,
      salesCode: req.salesCode,
      curr: req.curr,
      rate: req.rate,
      includeTax: req.includeTax,
      custCode: req.custCode,
      deliveryDate: req.deliveryDate,
      billAddr: req.billAddr,
      top: req.top,
      tax: req.tax,
      downPayment: req.downPayment,
      applyTax: req.applyTax,
      notes: req.notes,
      dpTax: req.dpTax,
      shipmentFee: req.shipmentFee,
      handlingFee: req.handlingFee,
      dpp: req.dpp,
      subTotal: req.subTotal,
      finalDiscPercent: req.finalDiscPercent,
      finalDisc: req.finalDisc,
      taxPercent: req.taxPercent,
      taxAmount: req.taxAmount,
      grandTotal: req.grandTotal
    })
      // .then(response => {
      //   data_h = response.data
      // })
  
    // Insert item details
    for (var i = 0; i < req.itemDetails.length; i++) {
      axiosJsonServer.post('/salesOrder_D', {
        rowId: req.itemDetails[i].rowId,
        code: code,
        lineNo: (i + 1),
        itemId: req.itemDetails[i].itemId,
        itemCode: req.itemDetails[i].itemCode,
        itemName: req.itemDetails[i].itemName,
        qty: req.itemDetails[i].qty,
        uomId: req.itemDetails[i].uomId,
        unitId: req.itemDetails[i].unitId,
        unitName: req.itemDetails[i].unitName,
        uomSellName: req.itemDetails[i].uomSellName,
        unitPrice: req.itemDetails[i].unitPrice,
        itemSellPrice: req.itemDetails[i].itemSellPrice,
        disc: req.itemDetails[i].disc,
        nettPrice: req.itemDetails[i].nettPrice,
        total: req.itemDetails[i].total,
        // taxAmount: req.itemDetails[i].taxAmount,
        // dpp: req.itemDetails[i].dpp,
        description: req.itemDetails[i].description
      })
    }

    result.success = true
    result.message = 'Success insert record.'
    // result.data = response.data
  } else if (req.action.toLowerCase() == 'edit') {
    const response_h = await axiosJsonServer.get(`/salesOrder_H?code=${req.code}`)
    const id = response_h.data[0].id

    // Update header
    axiosJsonServer.put(`/salesOrder_H/${id}`, {
      code: req.code,
      orderDate: req.orderDate,
      salesCode: req.salesCode,
      curr: req.curr,
      rate: req.rate,
      includeTax: req.includeTax,
      custCode: req.custCode,
      deliveryDate: req.deliveryDate,
      billAddr: req.billAddr,
      top: req.top,
      tax: req.tax,
      downPayment: req.downPayment,
      applyTax: req.applyTax,
      notes: req.notes,
      dpTax: req.dpTax,
      shipmentFee: req.shipmentFee,
      handlingFee: req.handlingFee,
      dpp: req.dpp,
      subTotal: req.subTotal,
      finalDiscPercent: req.finalDiscPercent,
      finalDisc: req.finalDisc,
      taxPercent: req.taxPercent,
      taxAmount: req.taxAmount,
      grandTotal: req.grandTotal
    })

    // Update item details
    for (var i = 0; i < req.itemDetails.length; i++) {
      if (req.itemDetails[i].id) {
        axiosJsonServer.put(`/salesOrder_D/${req.itemDetails[i].id}`, {
          rowId: req.itemDetails[i].rowId,
          code: req.itemDetails[i].code,
          lineNo: (i + 1),
          itemId: req.itemDetails[i].itemId,
          itemCode: req.itemDetails[i].itemCode,
          itemName: req.itemDetails[i].itemName,
          qty: req.itemDetails[i].qty,
          uomId: req.itemDetails[i].uomId,
          unitId: req.itemDetails[i].unitId,
          unitName: req.itemDetails[i].unitName,
          uomSellName: req.itemDetails[i].uomSellName,
          unitPrice: req.itemDetails[i].unitPrice,
          itemSellPrice: req.itemDetails[i].itemSellPrice,
          disc: req.itemDetails[i].disc,
          nettPrice: req.itemDetails[i].nettPrice,
          total: req.itemDetails[i].total,
          // taxAmount: req.itemDetails[i].taxAmount,
          // dpp: req.itemDetails[i].dpp,
          description: req.itemDetails[i].description
        })
      } else {
        axiosJsonServer.post('/salesOrder_D', {
          rowId: req.itemDetails[i].rowId,
          code: req.itemDetails[i].code,
          lineNo: (i + 1),
          itemId: req.itemDetails[i].itemId,
          itemCode: req.itemDetails[i].itemCode,
          itemName: req.itemDetails[i].itemName,
          qty: req.itemDetails[i].qty,
          uomId: req.itemDetails[i].uomId,
          unitId: req.itemDetails[i].unitId,
          unitName: req.itemDetails[i].unitName,
          uomSellName: req.itemDetails[i].uomSellName,
          unitPrice: req.itemDetails[i].unitPrice,
          itemSellPrice: req.itemDetails[i].itemSellPrice,
          disc: req.itemDetails[i].disc,
          nettPrice: req.itemDetails[i].nettPrice,
          total: req.itemDetails[i].total,
          // taxAmount: req.itemDetails[i].taxAmount,
          // dpp: req.itemDetails[i].dpp,
          description: req.itemDetails[i].description
        })
      }
    }

    result.success = true
    result.message = 'Success update record.'
  }
  
  return [200, { success: result.success, message: result.message }]
})

mock.onDelete(/\/api\/sales-order\/./).reply(async (config) => {
  const urlSegment = config.url.split('/')
  
  // Delete sales order header
  const response_h = await axiosJsonServer.get(`/salesOrder_H?code=${urlSegment[urlSegment.length - 1]}`)
  if (response_h.data.length > 0) {
    axiosJsonServer.delete(`/salesOrder_H/${response_h.data[0].id}`)
  }

  // Delete sales order detail
  const response_d = await axiosJsonServer.get(`/salesOrder_D?code=${urlSegment[urlSegment.length - 1]}`)
  for (var i = 0; i < response_d.data.length; i++) {
    axiosJsonServer.delete(`/salesOrder_D/${response_d.data[i].id}`)
  }
  
  return [200, { success: true, message: 'Success delete record.' }]
})
