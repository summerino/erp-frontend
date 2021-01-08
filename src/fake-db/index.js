import mock from './mock'

import './data/user'
import './data/inventory'

mock.onAny().passThrough() // forwards the matched request over network