export default [
  { icon: 'mdi-alpha-m-circle-outline', text: 'Data Master', regex: /^\/general/,
    items: [
      { text: 'Pelanggan', regex: /^\/general\/customer/,
        items: [
          { text: 'Pelanggan', link: 'customer' },
          { text: 'Tipe', link: 'customer-type' }
        ]
      },
      { text: 'Supplier', regex: /^\/general\/supplier/,
        items: [
          { text: 'Supplier', link: 'supplier' },
          { text: 'Tipe', link: 'supplier-type' }
        ]
      },
      { text: 'Karyawan', link: 'employee' },
      { text: 'Kendaraan', regex: /^\/general\/vehicle/,
        items: [
          { text: 'Kendaraan', link: 'vehicle' },
          { text: 'Tipe', link: 'vehicle-type' }
        ]
      },
      { text: 'Pajak', link: 'tax' },
      { text: 'Pembayaran', link: 'payment-term' }
    ]
  }
]
