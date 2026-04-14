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
                }
            ]
        }
    ],
})

export default router
