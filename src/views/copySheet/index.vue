<template>
  <div class="copy-sheet-wrap">
    <gc-spread-sheets-designer :styleInfo='styleInfo' :spreadOptions="spreadOptions" @designerInitialized='designerInitialized'>
    </gc-spread-sheets-designer>
  </div>
</template>

<script>

  
  import GC from '@grapecity/spread-sheets';
  import { Designer } from '@grapecity/spread-sheets-designer-vue'
  import { pivotSales } from './data.js'

  export default {
    name: 'copySheet',
    data: function () {
    var config = GC.Spread.Sheets.Designer.DefaultConfig;
      return {
        styleInfo: { height: "100%", width: '100%' },
        config: config,
        spreadOptions: {
          sheetCount: 3,
        },
        designer: null,
        spread: null,
      };
    },
    methods: {
      designerInitialized(value) {
        this.designer = value;
        this.spread = value.getWorkbook()
        let workbook = this.spread
        /**
         * 禁止修改表名
         * 不能拖拽表单来改变表单顺序
         * 是否隐藏新建标签
         * 
         * 表单标签导航栏 tabNavigationVisible 
         * 表单底部标签的长度 默认0.5
         */
        workbook.options.tabEditable = false
        workbook.options.allowSheetReorder = false
        workbook.options.newTabVisible = false
        // workbook.options.tabNavigationVisible  = true
        // workbook.options.tabStripRatio = 0.8
        
        /**
         * 在激活时改变sheet页tab标签的颜色
         * 改变之后不会消失，后续研究
         */
        // workbook.bind(GC.Spread.Sheets.Events.ActiveSheetChanged	, function (s, e) {
        //     workbook.getActiveSheet().options.sheetTabColor = "rgb(31,187,125)";
        // });
        this.initSheets(workbook)
        // setTimeout(() => {
        this.addSheet(workbook)
        // }, 2000)
      },
      /**
       * 初始化表格
       */
      initSheets(initwork) {
        initwork.suspendPaint();
        let sheet = initwork.getSheet(0);
        
        sheet.setRowCount(117);
        sheet.setColumnWidth(0, 150);
        sheet.getCell(-1, 0).formatter("YYYY-mm-DD");
        sheet.getRange(-1,4,0,2).formatter("$ #,##0");
        sheet.setArray(0, 0, pivotSales);
        let table = sheet.tables.add('tableSales', 0, 0, 117, 6);
        for(let i=2;i<=117;i++)
        {
          sheet.setFormula(i-1,5,'=D'+i+'*E'+i)
        }
        table.style(GC.Spread.Sheets.Tables.TableThemes["none"]);
        initwork.resumePaint();
      },
      /**
       * 
       * 根据品种种类 新增表格
       * 复制样式和公式
       * 
       */
      addSheet(addwork) {
        // 品种标识 最多10个
        let indenty = {
          num: [1,2,3,4,5,6,7,8,9,10],
          letter: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
        }
        // 品种总类
        let variety = ['', '']
        let varLen = variety.length
        /***
         *  品种一的配售结果：varLen
         *  品种一配售后品种一比例结果 2 * varLen + 3
         * */ 
        // let sheet0JSON = addwork.getSheet(0).toJSON();
        let sheet0JSON = addwork.getSheetFromName('Sheet1').toJSON({ includeBindingSource: true });

        variety.forEach((item, index) => {
          let sheetName = 'A' + (index + 1)
          let sheetScaleName = `配售后品种${indenty.letter[index]}比例结果`
          let sheetPlacingName = `品种${indenty.letter[index]}配售结果`
          if (index > 0) {
            // addwork.addSheet(index);
            // addwork.getSheet(index).fromJSON(sheet0JSON)
            addwork.addSheet(index, new GC.Spread.Sheets.Worksheet(sheetName));
            
            addwork.getSheetFromName(sheetName).fromJSON(sheet0JSON)
            addwork.getSheet(index).name(sheetName)
            // addwork.getSheet(index).recalcAll(); // 重新计算表单中的所有公式。
            // this.spread.getActiveSheet().resumeCalcService(true); // 恢复计算服务。
            addwork.addSheet(index + varLen, new GC.Spread.Sheets.Worksheet(sheetPlacingName));
            addwork.addSheet(index + 2 * varLen, new  GC.Spread.Sheets.Worksheet(sheetScaleName));

            // sheet页签的颜色'rgb(146,208,80)'
            addwork.getSheet(index + varLen).options.sheetTabColor = 'rgb(247,150,70)'
          }
        })
      },
      
    }
  }
</script>
<style scoped>
.copy-sheet-wrap{
  width:100%;
  height:98%;
}
</style>