import jsPDF from 'jspdf'
// import 'jspdf-autotable'

const font_file_path = '/src/assets/font/SourceHanSansCN-Normal.ttf'
const font_family = 'SourceHanSansCN'

// 标签
// options = { no: '1.01', name: '名称', spec: '规格', supplier: '供应商', inbound_time: '2099-01-01' }
const template = (options) => {
    let f = new jsPDF({ orientation: 'landscape', format: [100, 70] })
    f.addFont(font_file_path, font_family, 'normal') // 加载字体
    f.setFont(font_family) // 设置字体
    // -- body --
    f.setLineWidth(0.25)
    // 水平框线
    f.line(3, 3, 97, 3)
    f.line(3, 15.8, 58.6, 15.8)
    f.line(3, 28.6, 58.6, 28.6)
    f.line(3, 41.4, 97, 41.4)
    f.line(3, 54.2, 97, 54.2)
    f.line(3, 67, 97, 67)
    // 垂直框线
    f.line(3, 3, 3, 67)
    f.line(58.6, 3, 58.6, 41.4)
    f.line(97, 3, 97, 67)
    // 二维码
    if (options.qr) f.addImage(options.qr, 'png', 59.6, 4, 36.4, 36.4)
    // 文本
    f.setFontSize(12) // 设置固定字段名称
    f.text('供应商：', 4, 11)
    f.text('入库时间：', 4, 23.8)
    f.text('编码：', 4, 36.6)
    f.text('名称：', 4, 49.4)
    f.text('型号：', 4, 62.2)
    // 计算各文本长度
    let std_font_size = 18 // 标准文本大小
    let meta = {
        supplier: { x: 20.9, y: 11.8, l: 36.7, mr: 16.9 },
        inbound_time:  { x: 25.1, y: 24.6, l: 32, mr: 21.6 },
        no:            { x: 16.7, y: 37.4, l: 40.9, mr: 12.7 },
        name:          { x: 16.7, y: 50.2, l: 79.3, mr: 12.7 },
        spec:          { x: 16.7, y: 63, l: 79.3, mr: 12.7 }
    }
    for (let k of Object.keys(meta)) {
        f.setFontSize(std_font_size)
        if (f.getTextWidth(options[k]) > meta[k].l) {
            let cur_font_size = std_font_size * meta[k].l / f.getTextWidth(options[k])
            // console.log(k, 'font size >>', cur_font_size)
            f.setFontSize(cur_font_size)
            f.text(options[k], meta[k].x, meta[k].y - (std_font_size - cur_font_size) * 0.13)
        } else {
            f.text(options[k], meta[k].x, meta[k].y)
        }
    }
        
    let blob = f.output('blob') // 生成PDF文件的Blob对象
    let url = URL.createObjectURL(blob) // 生成指向Blob对象的URL
    return url
}

export default template