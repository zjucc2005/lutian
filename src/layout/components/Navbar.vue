<script>
    import { useSidebarStore } from '@/stores/sidebar';
    export default {
        data() {
            return {
                sidebar: useSidebarStore()
            }
        },
        methods: {
            handleSidebarToggle() {
                this.sidebar.toggle()
            }
        }
    }
</script>

<template>
    <div class="navbar">
        <!-- sidebar collapse button -->
        <el-icon size="20" :class="{ 'is-collapse': sidebar.collapse }" style="width: 60px"
            @click="handleSidebarToggle">
            <Fold />
        </el-icon>
        <!-- breadcrumb path -->
        <el-breadcrumb separator="/">
            <transition-group name="breadcrumb">
                <el-breadcrumb-item v-for="(item, index) in ['首页', ...($route.meta.breadcrumb || [])]" :key="index"
                    :to="item === '首页' ? '/dashboard' : ''"
                    >
                    {{ item }}
                </el-breadcrumb-item>
            </transition-group>
        </el-breadcrumb>
        <!-- dropdownmenu -->
    </div>
</template>

<style scoped>
    .navbar {
        height: 100%;
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(0,21,41,.08);
    }
    .el-icon.is-collapse {
        transform: rotate(180deg);
    }
    .el-breadcrumb {
        flex: 1;
    }
    /* breadcrumb transition */
    .breadcrumb-move,
    .breadcrumb-enter-active,
    .breadcrumb-leave-active {
        transition: all 0.5s;
    }
    .breadcrumb-enter,
    .breadcrumb-leave-active {
        opacity: 0;
        transform: translateX(20px);
    }
    .breadcrumb-leave-active {
        position: absolute;
    }
</style>