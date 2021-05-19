export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Data Master', regex: /^\/inventory\/master/,
    items: [
      { text: 'Barang', regex: /^\/inventory\/master\/item/,
        items: [
          { text: 'Barang', link: 'item' },
          { text: 'Kategori', link: 'item-category' },
          { text: 'Grup', link: 'item-group' }
        ]
      },
      { text: 'Satuan Ukuran', link: 'unitofmeasurement' },
      { text: 'Gudang', link: 'warehouse' }
    ]
  },
  { icon: 'mdi-clipboard-edit-outline', text: 'Transaksi', regex: /^\/inventory\/transaction/,
    items: [
      { text: 'Transfer Persediaan', link: 'transfer-stock' },
      { text: 'Penyesuaian', link: 'adjustment' }
    ]
  },
  { icon: 'mdi-chart-line', text: 'Laporan', regex: /^\/inventory\/report/,
    items: [
    ]
  }
]
