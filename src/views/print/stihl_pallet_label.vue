<script>
    import QRCode from 'qrcode'
    import { gen_stihl_pallet_label } from '@/utils/gen_pdf/stihl_pallet_label'

    export default {
        data() {
            return {
                input: '', // 输入框
                sns: new Set(),   // 当前序列号列表
                sn_cnt: {},        // 当前序列号扫码计数
                setting: {},
                setting_default: {
                    sn_limit: 10,      // 每个标签最大序列号数量, cache
                    auto_print: true,  // 自动打印, cache
                },
                audio: {
                    success: new Audio('/assets/audio/success.mp3'),
                    warn: new Audio('/assets/audio/warn.mp3')
                },
                dialogSettingVisible: false,
                logs: [], // { t, nos }, cache
                ls: {
                    setting: 'stihl_pallet_label_setting',
                    logs: 'stihl_pallet_label_logs'
                }
            }
        },
        mounted() {
            // this.gen_pdf()
            this.$refs.input.focus() // 聚焦输入框
            this.setting = JSON.parse(localStorage.getItem(this.ls.setting)) || this.setting_default
            this.logs = JSON.parse(localStorage.getItem(this.ls.logs)) || []
        },
        methods: {
            add_log() {
                let log = { t: Date.now(), sns: Array.from(this.sns) }
                this.logs.unshift(log)
                localStorage.setItem(this.ls.logs, JSON.stringify(this.logs))
            },
            clear_logs() {
                this.logs = []
                localStorage.removeItem(this.ls.logs)
            },
            clear_sns() {
                this.sns = new Set()
                this.sn_cnt = {}
            },
            strftime(t) {
                let date = new Date(t)
                return date.toJSON().replace('T', ' ').replace('Z', '')
            },
            input_keydown(e) {
                if (e.key == 'Enter') {
                    let sn = this.input.trim()
                    if (!sn) return
                    if (this.sns.size >= this.setting.sn_limit) {
                        this.$message({ message: `单标签最大序列号数量不能超过 ${this.setting.sn_limit}`, type: 'error', showClose: true })
                        this.audio.warn.play()
                        this.input = ''
                        return
                    }
                    this.sn_cnt[sn] = (this.sn_cnt[sn] || 0) + 1
                    if (this.sns.has(sn)) {
                        this.$message({ message: '重复扫码', type: 'warning', showClose: true })
                        this.audio.success.play()
                    } else {
                        this.sns.add(sn)
                        this.audio.success.play()
                    }
                    if (this.sns.size >= this.setting.sn_limit && this.setting.auto_print) {
                        this.gen_pdf_and_print()
                        this.add_log()
                        this.clear_sns()
                    }
                    this.input = ''
                }
            },
            setting_change() {
                localStorage.setItem(this.ls.setting, JSON.stringify(this.setting))
            },
            iframe_print(url) {
                const iframe = document.createElement('iframe');
                iframe.style.position = 'fixed';
                iframe.style.right = '0';
                iframe.style.bottom = '0';
                iframe.style.width = '0';
                iframe.style.height = '0';
                iframe.style.border = '0';
                document.body.appendChild(iframe);

                iframe.src = url;
                iframe.onload = () => {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    setTimeout(() => {
                        document.body.removeChild(iframe); // 打印完成后清理
                        URL.revokeObjectURL(url); // 释放内存
                    }, 1000);
                };
            },
            async gen_pdf_and_print () {
                if (!this.sns.size) return
                const content = Array.from(this.sns).join(',') // 二维码内容
                const canvas = await QRCode.toCanvas(content, { margin: 0 })
                canvas.toBlob(async blob => {
                    const qrcode_url = URL.createObjectURL(blob);
                    // console.log('qrcode_url:', qrcode_url)
                    let pdf_url = gen_stihl_pallet_label({
                        // ...data
                        qr: qrcode_url
                    })
                    this.iframe_print(pdf_url)
                    URL.revokeObjectURL(qrcode_url) // 释放内存
                }, 'image/png')
            }
        }
    }
</script>

<template>
    <section>
        <el-row :gutter="10">
            <el-col :md="16">
                <!-- 扫码输入框 -->
                <el-input
                    ref="input"
                    v-model="input"
                    size="large"
                    clearable
                    clear-icon="CloseBold"
                    placeholder="Please input"
                    class="scan-input mb-15"
                    @keydown="input_keydown"
                    />
                <el-row :gutter="10" class="mb-15">
                    <el-col :md="12">
                        <el-descriptions title="打印设置" :column="1" size="small" border>
                            <template #extra>
                                <el-button size="small" @click="dialogSettingVisible = true">
                                    <el-icon><Edit /></el-icon> 修改
                                </el-button>
                            </template>
                            <el-descriptions-item label="单标签最大序列号数量">{{ setting?.sn_limit }}</el-descriptions-item>
                            <el-descriptions-item label="自动打印">{{ setting?.auto_print ? '是' : '否' }}</el-descriptions-item>
                        </el-descriptions>
                    </el-col>
                    <el-col :md="12">
                        <el-button type="primary" size="large" class="print-btn" @click="gen_pdf_and_print">
                            <el-icon v-if="setting?.auto_print" class="is-loading mr-10"><RefreshRight /></el-icon> 打印
                        </el-button>
                    </el-col>
                </el-row>
                <!-- 当前序列号 -->
                <el-card shadow="never">
                    <template #header>
                        <div class="card-header">
                            <div class="section-title">
                                当前序列号 <el-text type="primary" class="text-bold">{{ sns.size }} / {{ setting.sn_limit }}</el-text>
                            </div>

                            <el-popconfirm title="确认清空吗？" placement="bottom-end" @confirm="clear_sns">
                                <template #reference>
                                    <el-button type="danger" size="small">
                                        <el-icon><Delete /></el-icon> 清空
                                    </el-button>
                                </template>
                            </el-popconfirm>
                        </div>
                    </template>
                    <template v-if="sns.size">
                        <el-badge v-for="(sn, index) in sns" :key="index"
                            :value="this.sn_cnt[sn]"
                            :hidden="this.sn_cnt[sn] <= 1"
                            class="mr-10"
                            >
                            <el-button>{{ sn }}</el-button>
                        </el-badge>
                    </template>
                    <p v-else class="text-nomore">没有更多数据</p>
                </el-card>
            </el-col>

            <el-col :md="8">
                <!-- 扫描日志 -->
                <el-card shadow="never">
                    <template #header>
                        <div class="card-header">
                            <div class="section-title">
                                扫描日志 <el-text type="primary" class="text-bold">{{ logs.length }}</el-text> 行
                            </div>
                            <el-popconfirm title="确认清空吗？" placement="bottom-end" @confirm="clear_logs">
                                <template #reference>
                                    <el-button type="danger" size="small">
                                        <el-icon><Delete /></el-icon> 清空
                                    </el-button>
                                </template>
                            </el-popconfirm>
                        </div>
                    </template>

                    <el-timeline v-if="logs.length" style="padding-left: 20px; overflow: auto; max-height: calc(100vh - 137px);">
                        <el-timeline-item
                            v-for="(log, index) in logs"
                            :key="index"
                            :timestamp="strftime(log.t)"
                            type="primary"
                            placement="top"
                            hollow
                            >
                            {{ log.sns.join(',') }}
                        </el-timeline-item>
                    </el-timeline>
                    <p v-else class="text-nomore">没有更多数据</p>
                </el-card>   
            </el-col>
        </el-row>

        <el-dialog v-model="dialogSettingVisible" title="修改打印设置" width="480px">
            <el-form :model="setting" label-width="auto">
                <el-form-item label="单标签最大序列号数量">
                    <el-input-number v-model="setting.sn_limit" :min="1" :max="100" @change="setting_change" />
                </el-form-item>
                <el-form-item label="自动打印">
                    <el-switch v-model="setting.auto_print" @change="setting_change" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogSettingVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- <span>CHROME浏览器 --kiosk-printing</span>
        {{ $data }} -->
    </section>
</template>

<style scoped>
    /* .scan-input */
    :deep(.scan-input) {
        .el-input__wrapper {
            padding: 18px 15px;
        }
        .el-input__inner {
            height: 64px;
            font-size: 64px;
        }
    }
    :deep(.el-card) {
        .el-card__header {
            padding: 10px 15px;
        }
        .el-card__body {
            padding: 10px 15px;
        }
    }
    .text-bold {
        font-weight: bold;
    }
    .text-nomore {
        font-size: 14px;
        color: var(--el-color-info);
        text-align: center;
    }
    .section-title {
        font-size: 14px;
        font-weight: 700;
    }
    .card-header {
        display: flex;
        justify-content: space-between;
    }
    .mb-15 {
        margin-bottom: 15px;
    }
    .mr-10 {
        margin-right: 10px;
    }
    .print-btn {
        height: 100px;
        width: 100%;
        font-size: 36px;
    }
</style>