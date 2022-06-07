export default [{
  path: '/human-resource/report/attendance-report',
  name: 'attendance-report',
  component: () => import(/* webpackChunkName: "attendance-report" */ '@/views/humanresource/report/AttendanceReport.vue'),
  meta: {
    authRequired: true
  }
}]
