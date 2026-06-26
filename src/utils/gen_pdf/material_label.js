import jsPDF from 'jspdf'

const font_file_path = '/assets/font/SourceHanSansCN-Normal.ttf'
const font_family = 'SourceHanSansCN'

// 标签
// options = { no: '1.01', name: '名称', spec: '规格', supplier: '供应商', batch: '2099-01-01' }
const gen_pdf_material_label = (options) => {
    let f = new jsPDF({ orientation: 'landscape', format: [100, 70] })
    f.addFont(font_file_path, font_family, 'normal') // 加载字体
    f.setFont(font_family) // 设置字体
    f.setLineWidth(0.1)
    f.setFontSize(10)

    set_template(f, options, 0, 0)
    // // 水平框线
    // f.line(3, 3, 97, 3)
    // f.line(3, 10, 71, 10)
    // f.line(3, 17, 71, 17)
    // f.line(3, 29, 97, 29)
    // f.line(3, 41, 97, 41)
    // f.line(3, 53, 97, 53)
    // f.line(3, 60, 97, 60)
    // f.line(3, 67, 97, 67)
    // // 垂直框线
    // f.line(3, 3, 3, 67)
    // f.line(71, 3, 71, 29)
    // f.line(15.6, 3, 15.6, 67)
    // f.line(34, 41, 34, 53)
    // f.line(46.6, 41, 46.6, 53)
    // f.line(65, 41, 65, 53)
    // f.line(78.6, 41, 78.6, 53)
    // f.line(97, 3, 97, 67)
    // // 文本
    // let textBaseY = 0.7
    // // 固定字段
    // f.text('批次', 5.8, textBaseY + 7)
    // f.text('代码', 5.8, textBaseY + 14)
    // f.text('名称', 5.8, textBaseY + 23.5)
    // f.text('规格', 5.8, textBaseY + 35.5)
    // f.text('数量', 5.8, textBaseY + 47.5)
    // f.text('总数', 36.8, textBaseY + 47.5)
    // f.text('共计/\n箱(托)', 67.3, textBaseY + 45.5)
    // f.text('供应商', 4, textBaseY + 57)
    // f.text('备注', 5.8, textBaseY + 64)
    // // 变量
    // f.text(options.batch, 16.6, textBaseY + 7)
    // f.text(options.no, 16.6, textBaseY + 14)
    // let name_lines = []
    // let name_line = ''
    // for (let i = 0; i < options.name.length; i++) {
    //     if (f.getTextWidth(name_line + options.name[i]) > 53.4) {
    //         name_lines.push(name_line)
    //         name_line = ''
    //     }
    //     name_line += options.name[i]
    // }
    // name_lines.push(name_line)
    // f.text(name_lines.join('\n'), 16.6, textBaseY + 25.5 - name_lines.length * 2)
    // let spec_lines = []
    // let spec_line = ''
    // for (let i = 0; i < options.spec.length; i++) {
    //     if (f.getTextWidth(spec_line + options.spec[i]) > 79.4) {
    //         spec_lines.push(spec_line)
    //         spec_line = ''
    //     }
    //     spec_line += options.spec[i]
    // }
    // spec_lines.push(spec_line)
    // f.text(spec_lines.join('\n'), 16.6, textBaseY + 37.5 - spec_lines.length * 2)
    // f.text(String(options.qty),  24.8 - f.getTextWidth(String(options.qty)) / 2, textBaseY + 47.5)
    // f.text(String(options.sum_qty), 55.8 - f.getTextWidth(String(options.sum_qty)) / 2, textBaseY + 47.5)
    // f.text(String(options.plt_qty), 87.8 - f.getTextWidth(String(options.plt_qty)) / 2, textBaseY + 47.5)
    // f.text(options.supplier, 16.6, textBaseY + 57)
    // // 二维码
    // if (options.qr) f.addImage(options.qr, 'png', 72, 4, 24, 24)

    let blob = f.output('blob') // 生成PDF文件的Blob对象
    let url = URL.createObjectURL(blob) // 生成指向Blob对象的URL
    return url
}

// A4 排版
const gen_pdf_material_label_a4 = (options) => {
    let f = new jsPDF()
    f.addFont(font_file_path, font_family, 'normal') // 加载字体
    f.setFont(font_family) // 设置字体
    f.setLineWidth(0.1)
    f.setFontSize(10)
    
    set_template(f, options, 5, 5)
    set_template(f, options, 5, 75)
    set_template(f, options, 5, 145)
    set_template(f, options, 5, 215)
    set_template(f, options, 105, 5)
    set_template(f, options, 105, 75)
    set_template(f, options, 105, 145)
    set_template(f, options, 105, 215)
        
    let blob = f.output('blob') // 生成PDF文件的Blob对象
    let url = URL.createObjectURL(blob) // 生成指向Blob对象的URL
    return url
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
    gen_pdf_material_label,
    gen_pdf_material_label_a4
}