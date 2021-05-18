export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Data Master', regex: /^\/purchase\/master/,
    items: [
    ]
  },
  { icon: 'mdi-clipboard-edit-outline', text: 'Transaksi', regex: /^\/purchase\/transaction/,
    items: [
      { text: 'Pembelian', regex: /^\/purchase\/transaction\/purchase/,
        items: [
          { text: 'Order', link: 'purchase-order' },
          { text: 'Penerimaan', link: 'purchase-receive' },
          { text: 'Faktur', link: 'purchase-invoice' },
          { text: 'Retur', link: 'purchase-return-wo-doc' }
        ]
      },
      { text: 'Nota Debit', link: 'debit-memo' }
    ]
  },
  { icon: 'mdi-chart-line', text: 'Laporan', regex: /^\/purchase\/report/,
    items: [
    ]
  }
]
