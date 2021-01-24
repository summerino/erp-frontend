import mock from '@/fake-db/mock.js'
import { orderBy as _orderBy } from 'lodash'

const data = {
  uomConversions: [{
    id: 1,
    uomId: 1,
    uomCode: 'DUS @ 6 KLG',
    unitToConvert: 'KLG',
    unitEquivalent: 'KLG',
    conversion: 1.00000,
    isBaseUnit: 1,
    seq: 1
  }, {
    id: 2,
    uomId: 1,
    uomCode: 'DUS @ 6 KLG',
    unitToConvert: 'KLG',
    unitEquivalent: 'DUS',
    conversion: 6.00000,
    isBaseUnit: 0,
    seq: 2
  }, {
    id: 3,
    uomId: 2,
    uomCode: 'DUS @ 6 PAK X 20 BKS',
    unitToConvert: 'BKS',
    unitEquivalent: 'BKS',
    conversion: 1.00000,
    isBaseUnit: 1,
    seq: 1
  }, {
    id: 4,
    uomId: 2,
    uomCode: 'DUS @ 6 PAK X 20 BKS',
    unitToConvert: 'BKS',
    unitEquivalent: 'PAK',
    conversion: 20.00000,
    isBaseUnit: 0,
    seq: 2
  }, {
    id: 5,
    uomId: 2,
    uomCode: 'DUS @ 6 PAK X 20 BKS',
    unitToConvert: 'PAK',
    unitEquivalent: 'DUS',
    conversion: 6.00000,
    isBaseUnit: 0,
    seq: 3
  }, {
    id: 6,
    uomId: 3,
    uomCode: 'DUS @ 4 PAK X 6 BKS',
    unitToConvert: 'BKS',
    unitEquivalent: 'BKS',
    conversion: 1.00000,
    isBaseUnit: 1,
    seq: 1
  }, {
    id: 7,
    uomId: 3,
    uomCode: 'DUS @ 4 PAK X 6 BKS',
    unitToConvert: 'BKS',
    unitEquivalent: 'PAK',
    conversion: 6.00000,
    isBaseUnit: 0,
    seq: 2
  }, {
    id: 8,
    uomId: 3,
    uomCode: 'DUS @ 4 PAK X 6 BKS',
    unitToConvert: 'PAK',
    unitEquivalent: 'DUS',
    conversion: 4.00000,
    isBaseUnit: 0,
    seq: 3
  }]
}

mock.onPost('/api/uom-conversion/list').reply((request) => {
  const { uomId } = JSON.parse(request.data)

  let results = data.uomConversions.filter(c => c.uomId == uomId)

  results = _orderBy(results, 'seq');
  
  return [200, results]
})
