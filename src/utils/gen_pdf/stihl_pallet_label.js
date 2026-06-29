import jsPDF from 'jspdf';

// 序列号个数 (10,200]
// options = [ { mat_name, mat_no, page, total_pages, _ean, _qr, _sns } ]
const gen_stihl_pallet_label = (options) => {
    let f = new jsPDF({ orientation: 'landscape' })
    f.setLineWidth(1)
    for (let opt of options) {
        // 垂直框线
        f.line(77, 10, 77, 200)
        // 水平框线
        f.line(10, 37, 77, 37)
        f.line(10, 64, 77, 64)
        f.line(10, 106, 77, 106)
        f.line(10, 133, 77, 133)

        f.setFontSize(14)
        f.text('Product', 10, 17)
        f.text('Article Number', 10, 44)
        f.text('EAN Code', 10, 71)
        f.text('Pages', 10, 113)
        f.setFontSize(22)
        f.text(opt.mat_name, 43.5 - f.getTextWidth(opt.mat_name) / 2, 33)
        f.text(opt.mat_no, 43.5 - f.getTextWidth(opt.mat_no) / 2, 60)
        f.setFontSize(32)
        let pages = `${opt.page} / ${opt.total_pages}`
        f.text(pages, 43.5 - f.getTextWidth(pages) / 2, 126)

        if (opt._ean) f.addImage(opt._ean, 'png', 10, 75, 64, 28)
        if (opt._qr) f.addImage(opt._qr, 'png', 10, 137, 63, 63)
        for (let i = 0; i < opt._sns.length; i++) {
            let [x, y] = [i % 5, Math.floor(i / 5)]
            f.addImage(opt._sns[i], 79.5 + x * 42.5, 10 + y * 19, 37.5, 19)
        }
        if (opt.page < opt.total_pages) {
            f.addPage()
        }
    }
    let blob = f.output('blob') // 生成PDF文件的Blob对象
    let url = URL.createObjectURL(blob) // 生成指向Blob对象的URL
    return url
}


// 序列号个数 (200, ∞)
const gen_stihl_pallet_label_2 = (options) => {

}


export {
    gen_stihl_pallet_label,
    gen_stihl_pallet_label_2
}