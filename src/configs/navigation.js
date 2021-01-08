import menuInventories from './menus/inventory.menu'
import menuSales from './menus/sales.menu'

export default {
  // main navigation - side menu
  menu: [{
    text: '',
    items: [
      { icon: 'mdi-view-dashboard-outline', text: 'Dashboard', link: '/dashboard/analytics' },
      { icon: 'mdi-file-outline', text: 'Blank Page', link: '/blank' }
    ]
  }, {
    text: 'Inventory',
    items: menuInventories
  }, {
    text: 'Sales',
    items: menuSales
  }]
}
