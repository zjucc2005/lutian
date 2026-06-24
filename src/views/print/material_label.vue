<script>
    import QRCode from 'qrcode'
    import { gen_pdf_material_label, gen_pdf_material_label_a4 } from '@/utils/gen_pdf/material_label'

    export default {
        data() {
            return {
                qrcode_url: '',
                pdf_url: '',
                label_data: {
                    no: '1.03.14.18.0255', 
                    name: '纸箱', 
                    spec: 'OKAYAMA OKY3600B-8 605x445x455mm/彩箱覆亮膜 尼日利亚专用 D299专用 A01(2025.06.21)', 
                    qty: 300,
                    sum_qty: 15000,
                    plt_qty: 50,
                    supplier: '台州市路桥嘉鑫包装有限公司', 
                    batch: '2026-04-14 10:49',
                }
            }
        },
        mounted() {
            // this.gen_pdf()
        },
        methods: {
            async gen_pdf () {
                const canvas = await QRCode.toCanvas('1.03.14.18.0255', { margin: 0 })
                canvas.toBlob(blob => {
                    // 此时blob就是你的二维码图片的Blob对象
                    this.qrcode = blob
                    console.log(blob); // 可以在这里处理blob，例如创建URL或者下载
                    const qrcode_url = URL.createObjectURL(blob);
                    this.qrcode_url = qrcode_url;
                    
                    // 清理URL对象
                    // URL.revokeObjectURL(qrcode_url)
                    let pdf_url = gen_pdf_material_label({ 
                        ...this.label_data,
                        qr: qrcode_url
                    })
                    this.pdf_url = pdf_url
                    // window.open(url, 'newWindow', 'width=800,height=600') // 打开小窗口
                }, 'image/png')
            },
            async gen_pdf_a4 () {
                const canvas = await QRCode.toCanvas('1.03.14.18.0255', { margin: 0 })
                canvas.toBlob(blob => {
                    // 此时blob就是你的二维码图片的Blob对象
                    this.qrcode = blob
                    console.log(blob); // 可以在这里处理blob，例如创建URL或者下载
                    const qrcode_url = URL.createObjectURL(blob);
                    this.qrcode_url = qrcode_url;
                    let pdf_url = gen_pdf_material_label_a4({ 
                        ...this.label_data,
                        qr: qrcode_url
                    })
                    this.pdf_url = pdf_url
                    // window.open(url, 'newWindow', 'width=800,height=600') // 打开小窗口
                }, 'image/png')
            }
        }
    }
</script>

<template>
    <section style="margin: -10px -15px;">
        <el-row>
            <el-col :span="12">
                <div>{{ $data }}</div>
                <el-image :src="qrcode_url" />
                <el-button type="primary" @click="gen_pdf">生成100x70标签</el-button>
                <el-button type="primary" @click="gen_pdf_a4">生成A4</el-button>
            </el-col>
            <el-col :span="12">
                <iframe v-if="pdf_url" :src="pdf_url" title="PDF" style="width: 100%; height: calc(100vh - 56px);"></iframe>
            </el-col>
        </el-row>
    </section>
</template>

<style>
</style>