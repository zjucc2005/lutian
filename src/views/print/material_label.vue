<script>
    import QRCode from 'qrcode'
    import gen_pdf_material_label from '@/utils/gen_pdf/material_label'

    export default {
        data() {
            return {
                qrcode_url: '',
                pdf_url: ''
            }
        },
        mounted() {
            // this.gen_pdf()
        },
        methods: {
            async gen_pdf () {
                const canvas = await QRCode.toCanvas('hello world', { scale: 4 })
                canvas.toBlob(blob => {
                    // 此时blob就是你的二维码图片的Blob对象
                    this.qrcode = blob
                    console.log(blob); // 可以在这里处理blob，例如创建URL或者下载
                    const qrcode_url = URL.createObjectURL(blob);
                    this.qrcode_url = qrcode_url;
                    
                    // 清理URL对象
                    // URL.revokeObjectURL(qrcode_url)
                    let pdf_url = gen_pdf_material_label({ 
                        no: '1.01', 
                        name: '名称', 
                        spec: '规格', 
                        supplier: '供应商', 
                        inbound_time: '2099-01-01',
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
                <el-button type="primary" @click="gen_pdf">生成PDF测试</el-button>
            </el-col>
            <el-col :span="12">
                <iframe v-if="pdf_url" :src="pdf_url" title="PDF" style="width: 100%; height: calc(100vh - 56px);"></iframe>
            </el-col>
        </el-row>
    </section>
</template>

<style>
</style>