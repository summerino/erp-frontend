import menuGeneral from './menus/general.menu'
import menuInventories from './menus/inventory.menu'
import menuPurchases from './menus/purchase.menu'
import menuSales from './menus/sales.menu'
import menuAccounting from './menus/accounting.menu'
import menuParameter from './menus/parameter.menu'
import menuSystemManagement from './menus/systemmanagement.menu'

export default {
  // main navigation - side menu
  menu: [
    {
      text: '',
      items: [
        {
          icon: 'mdi-view-dashboard-outline',
          text: 'Dasbor',
          link: 'dashboard'
        }
      ]
    },
    {
      text: 'Umum',
      items: menuGeneral
    },
    {
      text: 'Persediaan',
      items: menuInventories
    },
    {
      text: 'Pembelian',
      items: menuPurchases
    },
    {
      text: 'Penjualan',
      items: menuSales
    },
    {
      text: 'Akunting',
      items: menuAccounting
    },
    {
      text: 'Manajemen Sistem',
      items: menuSystemManagement
    },
    {
      text: 'Parameter',
      items: menuParameter
    }
  ]
}
