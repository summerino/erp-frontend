import mock from './mock'

import './currency'
import './customer'
import './inventory'
import './purchase'
import './sales'
import './salesman'
import './supplier'
import './tax'
import './user'
import './worker'

mock.onAny().passThrough() // forwards the matched request over network