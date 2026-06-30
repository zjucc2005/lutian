<script>
    import { ElLoading } from 'element-plus';
    import QRCode from 'qrcode';
    import JsBarcode from 'jsbarcode';
    import * as XLSX from 'xlsx';
    import { gen_stihl_pallet_label, gen_stihl_pallet_label_2 } from '@/utils/gen_pdf/stihl_pallet_label';

    export default {
        data() {
            return {
                input: '',           // 输入框
                sns: new Set(),      // 当前序列号列表
                sn_cnt: {},          // 当前序列号扫码计数
                orders: [],          // 订单信息， { orderno, pre, seq_s, seq_e, suf, active, printed, logs, t }
                active_order: {},    // 当前扫码的订单
                drawer_order: {},    // 当前显示详情的订单
                drawer_tab: '0',       // drawer标签页
                order_form: {
                    orderno: '',
                    mat_name: '',
                    mat_no: '',
                    ean: '',
                    pre: '',
                    seq_s: 0,
                    seq_e: 0,
                    seq_l: 1,
                    suf: '',
                },
                order_form_rules: {
                    orderno: [
                        { required: true, message: '请输入订单号', trigger: 'blur' }
                    ],
                    mat_name: [
                        { required: true, message: '请输入产品名称', trigger: 'blur' }
                    ],
                    mat_no: [
                        { required: true, message: '请输入产品编码', trigger: 'blur' }
                    ],
                    ean: [
                        { required: true, message: '请输入EAN编码', trigger: 'blur' }
                    ],
                    pre: [
                        { required: true, message: '请输入序列号前缀', trigger: 'blur' }
                    ],
                    seq_s: [
                        { required: true, message: '请输入流水号开始', trigger: 'blur' }
                    ],
                    seq_e: [
                        { required: true, message: '请输入流水号结束', trigger: 'blur' },
                        { trigger: 'blur', validator: (rule, value, callback) => {
                            if (this.order_form.seq_s && this.order_form.seq_s > value) {
                                return callback(new Error(`流水号结束必须 >= ${this.order_form.seq_s}`))
                            }
                            callback()
                        }}
                    ],
                    seq_l: [
                        { required: true, message: '请输入流水号长度', trigger: 'blur' },
                        { trigger: 'blur', validator: (rule, value, callback) => {
                            let minlen = String(this.order_form.seq_e).length
                            if (minlen > value) {
                                return callback(new Error(`流水号长度必须 >= ${minlen}`))
                            }
                            callback()
                        }}
                    ],
                },
                setting: {},
                setting_default: {
                    sn_limit: 50,      // 每个标签最大序列号数量
                    auto_print: true,  // 标签满足最大数量后自动打印
                    // auto_clear_after_print: true,  // 打印后自动清空序列号
                },
                dialogSettingFormVisible: false,
                dialogOrderFormVisible: false,
                drawerOrderVisible: false,
                audio: {
                    success: new Audio('/assets/audio/success.mp3'),
                    warn: new Audio('/assets/audio/warn.mp3')
                },
                ls: {
                    orders: 'stihl_pallet_label_orders',
                    setting: 'stihl_pallet_label_setting',
                    logs: 'stihl_pallet_label_logs'
                }
            }
        },
        mounted() {
            // let arr = []
            // for (let i = 1; i <= 48; i++) {
            //     arr.push('12345' + this.get_seq(i, 4))
            // }
            // this.sns = new Set(arr)
            // 聚焦输入框
            this.$refs.input.focus() 
            // 初始化数据
            this.setting = JSON.parse(localStorage.getItem(this.ls.setting)) || this.setting_default
            this.init_order_form()
            this.orders = JSON.parse(localStorage.getItem(this.ls.orders)) || []
            for (let order of this.orders) {
                if (order.active) {
                    this.active_order = order
                    break
                }
            }
        },
        methods: {
            debug() {
                console.log('>>> $data', this.$data)
                console.log('>>>', QRCode)
            },
            add_log() {
                let log = { t: Date.now(), sns: Array.from(this.sns) }
                for (let sn of log.sns) this.active_order.printed[sn] = true
                this.active_order.logs.unshift(log)
                this.local_storage('orders')
            },
            init_order_form() {
                this.order_form = { orderno: '', pre: '', seq_s: 0, seq_e: 0, seq_l: 1, suf: '' }
            },
            init_sns() {
                this.sns = new Set()
                this.sn_cnt = {}
            },
            local_storage(field) {
                localStorage.setItem(this.ls[field], JSON.stringify(this[field]))
            },
            strftime(t) {
                let date = new Date(t)
                return date.toLocaleString()
            },
            input_keydown(e) {
                if (e.key == 'Enter') {
                    let sn = this.input.trim()
                    if (!sn) return
                    // check format of sn
                    if (!this.active_order?.t) {
                        this.$message({ message: '请先激活订单', type: 'error', showClose: true })
                        this.audio.warn.play()
                        this.input = ''
                        return
                    }
                    if (this.active_order.printed[sn] === undefined) {
                        this.$message({ message: `无效序列号, ${sn}`, type: 'error', showClose: true })
                        this.audio.warn.play()
                        this.input = ''
                        return
                    }
                    if (this.active_order.printed[sn]) {
                        this.$message({ message: `序列号已打印, ${sn}`, type: 'error', showClose: true })
                        this.audio.warn.play()
                        this.input = ''
                        return
                    }
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
                    }
                    this.input = ''
                }
            },
            new_order() {
                if (this.orders.length >= 20) {
                    this.$message({ message: '保存订单数量已达 20 个上限，请先删除再新增', type: 'warning', showClose: true })
                } else {
                    this.dialogOrderFormVisible = true
                }
            },
            async save_order(){
                try {
                    await this.$refs.order_form.validate()
                    let order = {
                        ...this.order_form,
                        printed: {},
                        logs: [],
                        active: false,
                        t: Date.now()
                    }
                    // 生成序列号明细
                    for (let i = order.seq_s; i <= order.seq_e; i++) {
                        let sn = order.pre + this.get_seq(i, order.seq_l) + order.suf
                        order.printed[sn] = false
                    }
                    this.orders.unshift(order)
                    this.local_storage('orders')
                    this.dialogOrderFormVisible = false
                    this.init_order_form()
                    this.$message({ message: '新增订单成功', type: 'success', showClose: true })
                } catch (err) {
                    // console.log('err', err)
                }
            },
            activate_order() {
                let checked_orders = this.$refs.orderTable.getSelectionRows()
                if (checked_orders.length === 0) {
                    this.$message({ message: '请选择一个订单进行激活', type: 'error', showClose: true })
                } else if (checked_orders.length === 1) {
                    for (let order of this.orders) {
                        if (order.t === checked_orders[0].t) {
                            order.active = true
                            this.active_order = order
                        } else {
                            order.active = false
                        }
                    }
                    this.init_sns()
                    this.local_storage('orders')
                    this.$message({ message: '激活订单成功', type: 'success', showClose: true })
                } else {
                    this.$message({ message: '只能选择一个订单进行激活', type: 'error', showClose: true })
                }
            },
            delete_order() {
                let checked_orders = this.$refs.orderTable.getSelectionRows()
                if (checked_orders.length === 0) {
                    this.$message({ message: '请选择至少一个订单进行删除', type: 'error', showClose: true })
                } else {
                    let rem_orders = []
                    let del_orders_t = new Set(checked_orders.map(o => o.t))
                    for (let order of this.orders) {
                        if (!del_orders_t.has(order.t)) rem_orders.push(order)
                    }
                    this.orders = rem_orders
                    this.local_storage('orders')
                    this.$message({ message: '删除订单成功', type: 'success', showClose: true })
                }
            },
            export_order() {
                let checked_orders = this.$refs.orderTable.getSelectionRows()
                if (checked_orders.length === 0) {
                    this.$message({ message: '请选择至少一个订单进行导出', type: 'error', showClose: true })
                } else {
                    const loading = ElLoading.service({ lock: true, text: 'Loading', background: 'rgba(0, 0, 0, 0.7)' })
                    let book = XLSX.utils.book_new()
                    let table_head = ['订单号', '托盘序号', '序列号', '是否打印', '打印时间']
                    let table_body = []
                    for (let order of checked_orders) {
                        let pt = {} // 托盘序号 + 打印时间
                        for (let i = 0; i < order.logs.length; i++) {
                            let log = order.logs[i]
                            for (let sn of log.sns) pt[sn] = [order.logs.length - i, new Date(log.t)]
                        }
                        for (let sn of Object.keys(order.printed)) {
                            table_body.push([order.orderno, pt[sn]?.[0], sn, order.printed[sn] ? '是' : '否', pt[sn]?.[1]])
                        }
                    }
                    let sheet = XLSX.utils.aoa_to_sheet([table_head, ...table_body])
                    XLSX.utils.book_append_sheet(book, sheet, 'STIHL订单')
                    XLSX.writeFile(book, `STIHL订单_${this.strftime(Date.now())}.xlsx`, { compression: true, type: 'binary' });
                    this.$message({ message: '导出订单成功', type: 'success', showClose: true })
                    loading.close()
                }
            },
            show_order(order) {
                this.drawer_order = order
                this.drawer_tab = '0'
                this.drawerOrderVisible = true
            },
            print_percentage(order) {
                let [a, b] = [0, 0]
                for (let e of Object.values(order.printed)) {
                    if (e) a++
                    b++
                }
                if (a === 0) return 0
                if (a === b) return 100
                return Math.min(Math.round(a * 100 / b), 99) 
            },
            get_seq(i, len) {
                let s = String(i || 0)
                while (s.length < len) s = `0${s}`
                return s
            },
            // print function
            qrcode_content(mat_no, ean, fraction, sns) {
                return [mat_no, ean, fraction, ...sns].join('|') + '|'
            },
            // return image URL
            async draw_qrcode(text) {
                let canvas = await QRCode.toCanvas(text, { margin: 1, errorCorrectionLevel: 'M' })
                // console.log('>>> canvas.toDataURL()', canvas.toDataURL())
                return canvas.toDataURL()
            },
            draw_barcode_128(text) {
                let canvas = this.$refs.canvas
                JsBarcode(canvas, text, { height: 80, fontSize: 20 });
                // console.log('>>> canvas.toDataURL()', canvas.toDataURL())
                return canvas.toDataURL()
            },
            draw_barcode_upc(text) {
                let canvas = this.$refs.canvas
                JsBarcode(canvas, text, { format: 'upc', height: 80 });
                // console.log('>>> canvas.toDataURL()', canvas.toDataURL())
                return canvas.toDataURL()
            },
            async init_print_option(order, sns) {
                let data = []
                sns = Array.from(sns)
                sns.sort((x, y) => x > y ? 1 : -1) // asc order
                let total_pages = Math.ceil(sns.length / 50) // array split to 50 per slice
                for (let i = 0; i < total_pages; i++) {
                    let sns_per_page = sns.slice(50 * i, 50 * (i + 1))
                    let fraction = `${i+1}/${total_pages}`
                    let obj = {
                        mat_name: order.mat_name,
                        mat_no: order.mat_no,
                        page: i + 1,
                        total_pages: total_pages,
                        _ean: this.draw_barcode_upc(order.ean),
                        _qr: await this.draw_qrcode(this.qrcode_content(order.mat_no, order.ean, fraction, sns_per_page)),
                        _sns: []
                    }
                    for (let sn of sns_per_page) {
                        obj._sns.push(this.draw_barcode_128(sn))
                    }
                    data.push(obj)
                }
                return data
            },
            // 待定
            async init_print_option_2(order, sns) {
                let data = []
                sns = Array.from(sns)
                sns.sort((x, y) => x > y ? 1 : -1) // asc order
                let total_pages = Math.ceil(sns.length / 420)
                let fenmu = Math.ceil(sns.length / 70)
                for (let i = 0 ; i < total_pages; i++) {
                    let sns_per_page = sns.slice(420 * i, 420 * (i + 1))
                    let obj = {
                        mat_name: order.mat_name,
                        mat_no: order.mat_no,
                        page: i + 1,
                        total_pages: total_pages,
                        _ean: this.draw_barcode_upc(order.ean),
                        _qrs: []
                    }
                    let qr_cnt = Math.ceil(sns_per_page.length / 70)
                    for (let j = 0; j < qr_cnt; j++) {
                        let sns_per_qr = sns_per_page.slice(70 * j, 70 * (j + 1))
                        let fraction = `${i * 6 + j + 1}/${fenmu}`
                        obj._qrs.push(
                            await this.draw_qrcode(this.qrcode_content(order.mat_no, order.ean, fraction, sns_per_qr))
                        )
                    }
                    data.push(obj)
                }
                return data
            },
            iframe_print(url) {
                if (!url) return
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
                if (!this.sns.size) {
                    this.$message({ message: '当前序列号为空', type: 'warning', showClose: true })
                    return
                }
                let data = []
                let pdf_url = ''
                if (this.sns.size <= 200) {
                    data = await this.init_print_option(this.active_order, this.sns)
                    // console.log('>>> print data', data)
                    pdf_url = gen_stihl_pallet_label(data)
                } else {
                    data = await this.init_print_option_2(this.active_order, this.sns)
                    // console.log('>>> print data', data)
                    pdf_url = gen_stihl_pallet_label_2(data)
                }
                if (pdf_url) {
                    this.iframe_print(pdf_url)
                    this.add_log()
                    this.init_sns()
                }
            },
            async reprint(sns) {
                if (!sns.length) {
                    this.$message({ message: '当前序列号为空', type: 'warning', showClose: true })
                    return
                }
                let data = []
                let pdf_url = ''
                if (sns.length <= 200) {
                    data = await this.init_print_option(this.drawer_order, sns)
                    pdf_url = gen_stihl_pallet_label(data)
                } else {
                    data = await this.init_print_option_2(this.drawer_order, sns)
                    pdf_url = gen_stihl_pallet_label_2(data)
                }
                this.iframe_print(pdf_url)
            }
        }
    }
</script>

<template>
    <section>
        <!-- 绘图用画布 -->
        <canvas ref="canvas" style="display: none;"></canvas>
        <el-row :gutter="10">
            <el-col :md="8">
                <!-- 扫码输入框 --> 
                <el-input
                    ref="input"
                    v-model="input"
                    size="large"
                    clearable
                    clear-icon="CloseBold"
                    placeholder="Please input"
                    class="scan-input mb-10"
                    @keydown="input_keydown"
                    />
                <el-row :gutter="10">
                    <el-col :md="12">
                        <el-descriptions title="打印设置" :column="1" size="small" border class="mb-10">
                            <template #extra>
                                <el-button size="small" @click="dialogSettingFormVisible = true">
                                    <el-icon><Edit /></el-icon> 修改
                                </el-button>
                            </template>
                            <el-descriptions-item label="每托最大序列号数量">{{ setting?.sn_limit }}</el-descriptions-item>
                            <el-descriptions-item label="序列号已满自动打印">{{ setting?.auto_print ? '是' : '否' }}</el-descriptions-item>
                            <!-- <el-descriptions-item label="打印后自动清空序列号">{{ setting?.auto_clear_after_print ? '是' : '否' }}</el-descriptions-item> -->
                        </el-descriptions>
                    </el-col>
                    <el-col :md="12">
                        <el-button type="primary" size="large" class="print-btn mb-10" @click="gen_pdf_and_print()">
                            <el-icon v-if="setting?.auto_print" class="is-loading mr-10"><Setting /></el-icon> 打印
                        </el-button>
                    </el-col>
                </el-row>
                <!-- 当前序列号 -->
                <el-card shadow="never" class="mb-10">
                    <template #header>
                        <div class="card-header">
                            <div class="section-title">
                                当前序列号 <el-text type="primary" class="text-bold">{{ sns.size }} / {{ setting.sn_limit }}</el-text>
                            </div>

                            <el-popconfirm title="确认清空吗？" placement="bottom-end" @confirm="init_sns">
                                <template #reference>
                                    <el-button type="danger">清空</el-button>
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
                    <p v-else class="text-nomore">No Data</p>
                </el-card>
            </el-col>

            <el-col :md="16">
                <!-- 订单信息 -->
                <div>
                    <el-button type="primary" @click="new_order">新增</el-button>
                    <el-button type="success" @click="activate_order">激活</el-button>
                    <el-popconfirm title="确认删除吗？" placement="bottom-end" @confirm="delete_order">
                        <template #reference>
                            <el-button type="danger">删除</el-button>
                        </template>
                    </el-popconfirm>
                    <el-button type="info" @click="export_order">导出</el-button>
                    <!-- <el-button type="warning" @click="debug">DEBUG</el-button> -->
                </div>
                <el-table ref="orderTable" :data="orders" height="800">
                    <el-table-column type="selection" width="40" />
                    <el-table-column property="orderno" label="订单号" width="120" fixed>
                        <template #default="scope">
                            <el-link type="primary" @click="show_order(scope.row)">{{ scope.row.orderno }}</el-link>
                        </template>
                    </el-table-column>
                    <el-table-column property="active" label="是否激活" width="80" fixed>
                        <template #default="scope">
                            <el-tag v-if="scope.row.active" type="success" size="small">已激活</el-tag>
                            <el-tag v-else type="info" size="small">未激活</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column property="mat_name" label="产品名称" />
                    <el-table-column property="mat_no" label="产品编码" />
                    <el-table-column property="ean" label="EAN编码" width="115" />
                    <el-table-column property="seq" label="序列号" width="220">
                        <template #default="scope">
                            {{ `${scope.row.pre}${get_seq(scope.row.seq_s, scope.row.seq_l)}${scope.row.suf}` }} ~ {{ `${scope.row.pre}${get_seq(scope.row.seq_e, scope.row.seq_l)}${scope.row.suf}` }}
                        </template>
                    </el-table-column>
                    <el-table-column label="打印进度" width="160">
                        <template #default="scope">
                            <el-progress
                                :percentage="print_percentage(scope.row)"
                                :stroke-width="10"
                                :status="print_percentage(scope.row) >= 100 ? 'success' : ''"
                                :striped="scope.row.active"
                                :striped-flow="scope.row.active"
                                :duration="6"
                                />
                        </template>
                    </el-table-column>
                    <el-table-column label="创建时间" width="152">
                        <template #default="scope">{{ strftime(scope.row.t) }}</template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>

        <!-- 修改打印设置 -->
        <el-dialog v-model="dialogSettingFormVisible" title="修改打印设置" width="480px">
            <el-form :model="setting" label-width="auto">
                <el-form-item label="每托最大序列号数量">
                    <el-input-number v-model="setting.sn_limit" :min="1" :max="200" @change="local_storage('setting')" />
                </el-form-item>
                <el-form-item label="序列号已满自动打印">
                    <el-switch v-model="setting.auto_print" @change="local_storage('setting')" />
                </el-form-item>
                <!-- <el-form-item label="打印后自动清空序列号">
                    <el-switch v-model="setting.auto_clear_after_print" @change="local_storage('setting')" />
                </el-form-item> -->
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogSettingFormVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 订单表单 -->
        <el-dialog v-model="dialogOrderFormVisible" title="新增订单" width="600px">
            <el-form ref="order_form" :model="order_form" :rules="order_form_rules" label-width="auto">
                <el-form-item label="订单号" prop="orderno">
                    <el-input v-model="order_form.orderno" />
                </el-form-item>
                <el-form-item label="产品名称" prop="mat_name">
                    <el-input v-model="order_form.mat_name" />
                </el-form-item>
                <el-form-item label="产品编码" prop="mat_no">
                    <el-input v-model="order_form.mat_no" />
                </el-form-item>
                <el-form-item label="EAN编码" prop="ean">
                    <el-input v-model="order_form.ean" />
                </el-form-item>
                <el-form-item label="序列号前缀" prop="pre">
                    <el-input v-model="order_form.pre" />
                </el-form-item>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="流水号开始" prop="seq_s">
                            <el-input-number v-model="order_form.seq_s" :min="0" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        流水号预览：
                        <el-text type="success" size="large">{{ order_form.pre }}</el-text>
                        <el-text type="warning" size="large">{{ get_seq(order_form.seq_s, order_form.seq_l)  }}</el-text>
                        <el-text type="danger" size="large">{{ order_form.suf }}</el-text>
                    </el-col>
                </el-row>
                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="流水号结束" prop="seq_e">
                            <el-input-number v-model="order_form.seq_e" :min="0" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        流水号预览：
                        <el-text type="success" size="large">{{ order_form.pre }}</el-text>
                        <el-text type="warning" size="large">{{ get_seq(order_form.seq_e, order_form.seq_l)  }}</el-text>
                        <el-text type="danger" size="large">{{ order_form.suf }}</el-text>
                    </el-col>
                </el-row>
                <el-form-item label="流水号长度" prop="seq_l">
                    <el-input-number v-model="order_form.seq_l" :min="1" />
                </el-form-item>
                <el-form-item label="序列号后缀" prop="suf">
                    <el-input v-model="order_form.suf" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogOrderFormVisible = false">关闭</el-button>
                    <el-button @click="save_order">保存</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- 订单详情 -->
        <el-drawer
            v-model="drawerOrderVisible"
            :title="drawer_order.orderno"
            direction="rtl"
            size="50%"
        >
            <el-tabs v-model="drawer_tab">
                <el-tab-pane label="日志" name="0" class="drawer-tab-container">
                    <el-timeline v-if="drawer_order.logs.length" style="padding-left: 9px;">
                        <el-timeline-item
                            v-for="(log, index) in drawer_order.logs"
                            :key="index"
                            :timestamp="strftime(log.t)"
                            type="primary"
                            placement="top"
                            hollow
                            >
                            <el-tag v-for="(v, index) in log.sns" :key="index" size="small" round>{{ v }}</el-tag>
                            <br>
                            <el-popconfirm title="确认重新打印吗？" placement="bottom-end" width="160px" @confirm="reprint(log.sns)">
                                <template #reference>
                                    <el-link  underline="always" style="font-size: 12px;">重新打印</el-link>
                                </template>
                            </el-popconfirm>
                        </el-timeline-item>
                    </el-timeline>
                    <p v-else class="text-nomore">No Data</p>
                </el-tab-pane>
                <el-tab-pane label="明细" name="1" class="drawer-tab-container">
                    <el-tag v-for="(v, k) in drawer_order.printed" :key="k"
                        :type="v ? 'primary' : 'info'"
                        :effect="v ? 'light' : 'plain'"
                        size="small" round
                        >
                        {{ k }}
                    </el-tag>
                </el-tab-pane>
            </el-tabs>
        </el-drawer>
        <!-- <span>CHROME浏览器 --kiosk-printing</span> -->
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
    .mb-10 { margin-bottom: 10px; }
    .mb-15 { margin-bottom: 15px; }
    .mr-10 { margin-right: 10px; }
    .print-btn {
        height: 100px;
        width: 100%;
        font-size: 36px;
    }
    .drawer-tab-container {
        overflow: auto;
        max-height: calc(100vh - 172px);
    }
</style>