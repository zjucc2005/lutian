import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            redirect: '/dashboard',
            component: Layout,
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/dashboard/index.vue'),
                    meta: { title: 'Dashboard' }
                },
                { 
                    path: 'print/material_label',
                    name: '物料标签',
                    component: () => import('@/views/print/material_label.vue'),
                    meta: { title: '物料标签', breadcrumb: ['打印', '物料标签'] }
                },
                {
                    path: 'print/stihl_pallet_label',
                    name: 'STIHL托盘标贴',
                    component: () => import('@/views/print/stihl_pallet_label.vue'),
                    meta: { title: 'STIHL托盘标贴', breadcrumb: ['打印', 'STIHL托盘标贴'] }
                }
            ]
        }
    ],
})

export default router
