export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Data Master', regex: /^\/sales\/master/,
    items: [
      { text: 'Area', link: 'area' }
    ]
  },
  { icon: 'mdi-clipboard-edit-outline', text: 'Transaksi', regex: /^\/sales\/transaction/,
    items: [
      { text: 'Penjualan', regex: /^\/sales\/transaction\/sales/,
        items: [
          { text: 'Order', link: 'sales-order' },
          { text: 'Delivery', link: 'delivery-order' },
          { text: 'Faktur', link: 'sales-invoice' },
          { text: 'Return', link: 'sales-return-wo-doc' }
        ]
      },
      { text: 'Nota Kredit', link: 'credit-memo' }
    ]
  },
  { icon: 'mdi-chart-line', text: 'Laporan', regex: /^\/sales\/report/,
    items: [
    ]
  }
]
