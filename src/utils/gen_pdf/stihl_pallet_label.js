import jsPDF from 'jspdf';
import QRCode from 'qrcode';


const font_file_path = '/assets/font/SourceHanSansCN-Normal.ttf'
const font_family = 'SourceHanSansCN'

// 序列号个数 (10,200]
// options = [ { mat_name, mat_no, ean, sns, page, total_pages } ]
const gen_stihl_pallet_label = (options) => {
    let f = new jsPDF({ orientation: 'landscape', format: [100, 70] })
    f.addFont(font_file_path, font_family, 'normal') // 加载字体
    f.setFont(font_family) // 设置字体
    f.setLineWidth(0.1)
    f.setFontSize(10)
    f.text('中文字体',  67, 7)
    if (options.qr) f.addImage(options.qr, 'png', 5, 5, 60, 60)
    let blob = f.output('blob') // 生成PDF文件的Blob对象
    let url = URL.createObjectURL(blob) // 生成指向Blob对象的URL
    return url
}


// 序列号个数 (200, ∞)
const gen_stihl_pallet_label_2 = (options) => {

}

// @param f, jsPDF instance
// @param options, Object, input varible
// @param _x, int, offSetX
// @param _y, int, offSetY
const set_template = (f, options, _x, _y) => {
    // 水平框线
    f.line(3 + _x,  3 + _y, 97 + _x,  3 + _y)
    f.line(3 + _x, 10 + _y, 71 + _x, 10 + _y)
    f.line(3 + _x, 17 + _y, 71 + _x, 17 + _y)
    f.line(3 + _x, 29 + _y, 97 + _x, 29 + _y)
    f.line(3 + _x, 41 + _y, 97 + _x, 41 + _y)
    f.line(3 + _x, 53 + _y, 97 + _x, 53 + _y)
    f.line(3 + _x, 60 + _y, 97 + _x, 60 + _y)
    f.line(3 + _x, 67 + _y, 97 + _x, 67 + _y)
    // 垂直框线
    f.line(   3 + _x,  3 + _y,    3 + _x, 67 + _y)
    f.line(  71 + _x,  3 + _y,   71 + _x, 29 + _y)
    f.line(15.6 + _x,  3 + _y, 15.6 + _x, 67 + _y)
    f.line(  34 + _x, 41 + _y,   34 + _x, 53 + _y)
    f.line(46.6 + _x, 41 + _y, 46.6 + _x, 53 + _y)
    f.line(  65 + _x, 41 + _y,   65 + _x, 53 + _y)
    f.line(78.6 + _x, 41 + _y, 78.6 + _x, 53 + _y)
    f.line(  97 + _x,  3 + _y,   97 + _x, 67 + _y)
    // 文本
    let textBaseY = 0.7 + _y
    // 固定字段
    f.text('批次',  5.8 + _x, textBaseY + 7)
    f.text('代码',  5.8 + _x, textBaseY + 14)
    f.text('名称',  5.8 + _x, textBaseY + 23.5)
    f.text('规格',  5.8 + _x, textBaseY + 35.5)
    f.text('数量',  5.8 + _x, textBaseY + 47.5)
    f.text('总数', 36.8 + _x, textBaseY + 47.5)
    f.text('共计/\n箱(托)', 67.3 + _x, textBaseY + 45.5)
    f.text('供应商',  4 + _x, textBaseY + 57)
    f.text('备注',  5.8 + _x, textBaseY + 64)
    // 变量
    f.text(options.batch, 16.6 + _x, textBaseY + 7)
    f.text(options.no, 16.6 + _x, textBaseY + 14)
    let name_lines = []
    let name_line = ''
    for (let i = 0; i < options.name.length; i++) {
        if (f.getTextWidth(name_line + options.name[i]) > 53.4) {
            name_lines.push(name_line)
            name_line = ''
        }
        name_line += options.name[i]
    }
    name_lines.push(name_line)
    f.text(name_lines.join('\n'), 16.6 + _x, textBaseY + 25.5 - name_lines.length * 2)
    let spec_lines = []
    let spec_line = ''
    for (let i = 0; i < options.spec.length; i++) {
        if (f.getTextWidth(spec_line + options.spec[i]) > 79.4) {
            spec_lines.push(spec_line)
            spec_line = ''
        }
        spec_line += options.spec[i]
    }
    spec_lines.push(spec_line)
    f.text(spec_lines.join('\n'), 16.6 + _x, textBaseY + 37.5 - spec_lines.length * 2)
    f.text(String(options.qty),  24.8 - f.getTextWidth(String(options.qty)) / 2 + _x, textBaseY + 47.5)
    f.text(String(options.sum_qty), 55.8 - f.getTextWidth(String(options.sum_qty)) / 2 + _x, textBaseY + 47.5)
    f.text(String(options.plt_qty), 87.8 - f.getTextWidth(String(options.plt_qty)) / 2 + _x, textBaseY + 47.5)
    f.text(options.supplier, 16.6 + _x, textBaseY + 57)
    // 二维码
    if (options.qr) f.addImage(options.qr, 'png', 72 + _x, 4 + _y, 24, 24)
}

export {
    gen_stihl_pallet_label,
    gen_stihl_pallet_label_2
}