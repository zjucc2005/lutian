<script>
    import { useSidebarStore } from '@/stores/sidebar';
    export default {
        data() {
            return {
                sidebar: useSidebarStore()
            }
        }
    }
</script>

<template>
    <el-scrollbar max-height="100vh">
        <el-menu default-active="dashboard" :router="true" :collapse="sidebar.collapse">
            <el-menu-item index="/dashboard">
                <el-icon><Home-filled /></el-icon>
                <span>首页</span>
            </el-menu-item>
            <el-sub-menu index="print">
                <template #title>
                    <el-icon><Printer /></el-icon>
                    <span>打印</span>
                </template>
                <!-- <el-menu-item index="/print/material_label">
                    <el-icon><Van /></el-icon>
                    <span>物料标签</span>
                </el-menu-item> -->
                <el-menu-item index="/print/stihl_pallet_label">
                    <el-icon><Grid /></el-icon>
                    <span>STIHL托盘标贴</span>
                </el-menu-item>
                <!-- <el-menu-item index="print2">
                    <el-icon><van /></el-icon>
                    <span>其他标签</span>
                </el-menu-item> -->
            </el-sub-menu>
        </el-menu>
    </el-scrollbar>
</template>

<style scoped>
    .el-menu {
        min-height: 100vh;
        --el-menu-bg-color: #304156;
        --el-menu-hover-bg-color: #1d2b3b;
        --el-menu-text-color: #ffffff;
        --el-menu-active-color: #409eff;
    }
</style>