import mock from '@/fake-db/mock.js'

const data = {
  itemCategories: [{
    id: 1,
    code: 'BM',
    name: 'Bahan Makanan',
    parentId: null,
    deep: 0,
    seq: 1
  }, {
    id: 2,
    code: 'D',
    name: 'Minuman',
    parentId: null,
    deep: 0,
    seq: 2
  }, {
    id: 3,
    code: 'F',
    name: 'Makanan',
    parentId: null,
    deep: 0,
    seq: 3
  }, {
    id: 4,
    code: 'L',
    name: 'Lainnya',
    parentId: null,
    deep: 0,
    seq: 4
  }, {
    id: 5,
    code: 'NF',
    name: 'Bukan Makanan',
    parentId: null,
    deep: 0,
    seq: 5
  }, {
    id: 6,
    code: 'BM-GL',
    name: 'Bahan Makanan - Gula',
    parentId: 1,
    deep: 1,
    seq: 1
  }, {
    id: 7,
    code: 'BM-SG',
    name: 'Bahan Makanan - Sagu',
    parentId: 1,
    deep: 1,
    seq: 2
  }, {
    id: 8,
    code: 'BM-TP',
    name: 'Bahan Makanan - Tepung',
    parentId: 1,
    deep: 1,
    seq: 3
  }, {
    id: 9,
    code: 'BM-TR',
    name: 'Bahan Makanan - Terigu',
    parentId: 1,
    deep: 1,
    seq: 4
  }, {
    id: 10,
    code: 'BM-GL-I',
    name: 'Bahan Makanan - Gula - Industri',
    parentId: 6,
    deep: 2,
    seq: 1
  }, {
    id: 11,
    code: 'BM-GL-K',
    name: 'Bahan Makanan - Gula - Kemasan',
    parentId: 6,
    deep: 2,
    seq: 2
  }, {
    id: 12,
    code: 'BM-GL-Z',
    name: 'Bahan Makanan - Gula - Zak',
    parentId: 6,
    deep: 2,
    seq: 3
  }, {
    id: 13,
    code: 'BM-SG-K',
    name: 'Bahan Makanan - Sagu - Kemasan',
    parentId: 7,
    deep: 2,
    seq: 1
  }, {
    id: 14,
    code: 'BM-SG-Z',
    name: 'Bahan Makanan - Sagu - Zak',
    parentId: 7,
    deep: 2,
    seq: 2
  }, {
    id: 15,
    code: 'BM-TP-B',
    name: 'Bahan Makanan - Tepung - Beras',
    parentId: 8,
    deep: 2,
    seq: 1
  }, {
    id: 16,
    code: 'BM-TP-K',
    name: 'Bahan Makanan - Tepung - Ketan',
    parentId: 8,
    deep: 2,
    seq: 2
  }, {
    id: 17,
    code: 'BM-TR-F',
    name: 'Bahan Makanan - Terigu - Fighting',
    parentId: 9,
    deep: 2,
    seq: 1
  }, {
    id: 18,
    code: 'BM-TR-K',
    name: 'Bahan Makanan - Terigu - Kemasan',
    parentId: 9,
    deep: 2,
    seq: 2
  }, {
    id: 19,
    code: 'BM-TR-P',
    name: 'Bahan Makanan - Terigu - Premium',
    parentId: 9,
    deep: 2,
    seq: 3
  }, {
    id: 20,
    code: 'D-B',
    name: 'Minuman - Buah',
    parentId: 2,
    deep: 1,
    seq: 1
  }, {
    id: 21,
    code: 'D-I',
    name: 'Minuman - Ice',
    parentId: 2,
    deep: 1,
    seq: 2
  }, {
    id: 22,
    code: 'D-K',
    name: 'Minuman - Kopi',
    parentId: 2,
    deep: 1,
    seq: 3
  }, {
    id: 23,
    code: 'D-S',
    name: 'Minuman - Susu',
    parentId: 2,
    deep: 1,
    seq: 4
  }, {
    id: 24,
    code: 'D-T',
    name: 'Minuman - Teh',
    parentId: 2,
    deep: 1,
    seq: 5
  }, {
    id: 25,
    code: 'D-B-SI',
    name: 'Minuman - Buah - Serbuk Instan',
    parentId: 20,
    deep: 2,
    seq: 1
  }, {
    id: 26,
    code: 'D-I-EL',
    name: 'Minuman - Ice - Es Lilin',
    parentId: 21,
    deep: 2,
    seq: 1
  }, {
    id: 27,
    code: 'D-K-B',
    name: 'Minuman - Kopi - Bubuk',
    parentId: 22,
    deep: 2,
    seq: 1
  }, {
    id: 28,
    code: 'D-K-SI',
    name: 'Minuman - Kopi - Serbuk Instan',
    parentId: 22,
    deep: 2,
    seq: 2
  }, {
    id: 29,
    code: 'D-S-SI',
    name: 'Minuman - Susu - Serbuk Instan',
    parentId: 23,
    deep: 2,
    seq: 1
  }, {
    id: 27,
    code: 'D-T-D',
    name: 'Minuman - Teh - Daun',
    parentId: 24,
    deep: 2,
    seq: 1
  }, {
    id: 28,
    code: 'D-T-SI',
    name: 'Minuman - Teh - Serbuk Instan',
    parentId: 24,
    deep: 2,
    seq: 2
  }, {
    id: 29,
    code: 'F-C',
    name: 'Makanan - Canned',
    parentId: 3,
    deep: 1,
    seq: 1
  }, {
    id: 30,
    code: 'F-I',
    name: 'Makanan - Ingredient',
    parentId: 3,
    deep: 1,
    seq: 2
  }, {
    id: 31,
    code: 'F-S',
    name: 'Makanan - Snack',
    parentId: 3,
    deep: 1,
    seq: 3
  }, {
    id: 32,
    code: 'F-C-S',
    name: 'Makanan - Canned - Sarden',
    parentId: 29,
    deep: 2,
    seq: 1
  }, {
    id: 33,
    code: 'F-S-B',
    name: 'Makanan - Snack - Biskuit',
    parentId: 31,
    deep: 2,
    seq: 1
  }, {
    id: 34,
    code: 'F-S-CC',
    name: 'Makanan - Snack - Chocolate',
    parentId: 31,
    deep: 2,
    seq: 2
  }, {
    id: 35,
    code: 'F-S-CK',
    name: 'Makanan - Snack - Chiki',
    parentId: 31,
    deep: 2,
    seq: 3
  }, {
    id: 36,
    code: 'F-S-P',
    name: 'Makanan - Snack - Permen',
    parentId: 31,
    deep: 2,
    seq: 4
  }, {
    id: 37,
    code: 'F-I-KM',
    name: 'Makanan - Ingredient - Kerupuk Mentah',
    parentId: 30,
    deep: 2,
    seq: 1
  }, {
    id: 38,
    code: 'F-I-AJ',
    name: 'Makanan - Ingredient - Agar Jely',
    parentId: 30,
    deep: 2,
    seq: 2
  }, {
    id: 39,
    code: 'F-I-CP',
    name: 'Makanan - Ingredient - Cuka Putih',
    parentId: 30,
    deep: 2,
    seq: 3
  }, {
    id: 40,
    code: 'F-I-MB',
    name: 'Makanan - Ingredient - Mie Bihun',
    parentId: 30,
    deep: 2,
    seq: 4
  }, {
    id: 41,
    code: 'F-I-MG',
    name: 'Makanan - Ingredient - Minyak Goreng',
    parentId: 30,
    deep: 2,
    seq: 5
  }, {
    id: 42,
    code: 'F-I-MM',
    name: 'Makanan - Ingredient - Macaroni Mentah',
    parentId: 30,
    deep: 2,
    seq: 6
  }, {
    id: 43,
    code: 'F-I-TK',
    name: 'Makanan - Ingredient - Tepung Kue',
    parentId: 30,
    deep: 2,
    seq: 7
  }, {
    id: 44,
    code: 'NF-L',
    name: 'Bukan Makanan - Lilin',
    parentId: 5,
    deep: 1,
    seq: 1
  }, {
    id: 45,
    code: 'L-C',
    name: 'Lainnya - Cleaning',
    parentId: 4,
    deep: 1,
    seq: 1
  }, {
    id: 46,
    code: 'L-L',
    name: 'Lainnya - Laundry',
    parentId: 4,
    deep: 1,
    seq: 2
  }, {
    id: 47,
    code: 'L-T',
    name: 'Lainnya - Toiletries',
    parentId: 4,
    deep: 1,
    seq: 3
  }, {
    id: 48,
    code: 'L-C-PL',
    name: 'Lainnya - Cleaning - Pembersih Lantai',
    parentId: 45,
    deep: 2,
    seq: 1
  }, {
    id: 49,
    code: 'L-L-PS',
    name: 'Lainnya - Laundry - Pelembut Softener',
    parentId: 46,
    deep: 2,
    seq: 1
  }, {
    id: 50,
    code: 'L-L-PW',
    name: 'Lainnya - Laundry - Pemutih Whitener',
    parentId: 46,
    deep: 2,
    seq: 2
  }, {
    id: 51,
    code: 'L-L-SD',
    name: 'Lainnya - Laundry - Sabun Detergen',
    parentId: 46,
    deep: 2,
    seq: 3
  }, {
    id: 52,
    code: 'L-L-SK',
    name: 'Lainnya - Laundry - Sabun Krim',
    parentId: 46,
    deep: 2,
    seq: 4
  }, {
    id: 53,
    code: 'L-T-HS',
    name: 'Lainnya - Toiletries - Hair Shampoo',
    parentId: 47,
    deep: 2,
    seq: 1
  }, {
    id: 54,
    code: 'L-T-PG',
    name: 'Lainnya - Toiletries - Pasta Gigi',
    parentId: 47,
    deep: 2,
    seq: 2
  }, {
    id: 55,
    code: 'L-T-SG',
    name: 'Lainnya - Toiletries - Sikat Gigi',
    parentId: 47,
    deep: 2,
    seq: 3
  }, {
    id: 56,
    code: 'L-T-SM',
    name: 'Lainnya - Toiletries - Sabun Mandi',
    parentId: 47,
    deep: 2,
    seq: 4
  }]
}

mock.onPost('/api/item/category/list').reply((request) => {
  const datas = data.itemCategories

  return [200, datas]
})

mock.onGet('/api/item/category/hierarchy').reply(() => {
  const datas = [{
    id: 0,
    name: 'All Category',
    children: defineChildNodes(null)
  }]

  return [200, datas]
})

function defineChildNodes(parentId) {
  const nodes = data.itemCategories
    .filter(c => c.parentId == parentId)
    .map(itemChildren => {
      const result = {}

      result.id = itemChildren.id
      result.name = itemChildren.name
      result.children = defineChildNodes(itemChildren.id)

      return result
    })
    
  return nodes
}
