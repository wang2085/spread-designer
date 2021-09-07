<template>
  <div class="sheet-desinger-wrap">
    <gc-spread-sheets-designer :styleInfo='styleInfo' :spreadOptions="spreadOptions" @designerInitialized='designerInitialized'>
    </gc-spread-sheets-designer>
    <div class="operate-wrap">
      <p class="btn-operate" @click="addSPan2">设置单元格</p>
      <p class="btn-operate" @click="addSPan1">合并单元格-1行4列合并2行3列</p>
      
      <p class="btn-operate" @click="addSPan3">合并单元格-水平垂直居中</p>
      <div>
        <label>
            <input type="checkbox" @change="addSpan4($event)" />
            拖拽合并单元格
        </label>
      </div>
      <p class="btn-operate" @click="remove1">解除合并的单元格</p>
    </div>
  </div>
</template>

<script>

  
  import GC from '@grapecity/spread-sheets';
  import { Designer } from '@grapecity/spread-sheets-designer-vue'
  import { pivotSales } from './data.js'

  export default {
    name: 'sheetDesinger',
    data: function () {
    var config = GC.Spread.Sheets.Designer.DefaultConfig;
      return {
        styleInfo: { height: "100%", width: '80%' },
        config: config,
        spreadOptions: {
          sheetCount: 1,
        },
        designer: null,
        spread: null,
        sheet: null
      };
    },
    methods: {
      designerInitialized(value) {
        this.designer = value;
        this.spread = value.getWorkbook()
        this.sheet = this.spread.getSheet(0)
      },
      /**
       *   removeSpan   方法来分解指定包含合并的单元格
       * 
         * addSpan(row, column, rowCount, colCount, sheetArea)
                在指定表单区域中添加合并单元格。

                Name	    Type	        Description

                row	      number	      开始合并的单元格的行索引。
                column	  number	      开始合并的单元格的列索引。
                rowCount	number	      要合并的行数。
                colCount	number	      要合并的列数。
                sheetArea	GC.Spread.Sheets.SheetArea	optional 表单区域。 如果未提供此参数，则默认为 viewport 。
         */
      /**
       * 合并单元格-1行4列合并2行3列
       */
      addSPan1() {
        this.sheet.addSpan(1, 4, 2, 4, GC.Spread.Sheets.SheetArea.viewport)
        this.sheet.getCell(1, 4).value("从2行E列 合并长度 2行3列").hAlign.vAlign
      },
      /**
       * 设置单元格
       */
      addSPan2() {
        this.sheet
            .getCell(1, 1)
            .text('2行B列的值')
            .vAlign(GC.Spread.Sheets.VerticalAlign.center)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center);
      },
      /**
       * 合并单元格-水平垂直居中
       */
      addSPan3() {
        this.sheet.addSpan(5, 2, 5, 6)
          this.sheet.getCell(5, 2).value("从6行C列 合并长度 5行6列")
            .vAlign(GC.Spread.Sheets.VerticalAlign.center)
            .hAlign(GC.Spread.Sheets.HorizontalAlign.center);
      },
      addSpan4(e) {
        this.spread.options.allowUserDragMerge = e.target.checked
      },
      /**
       * 解除指定的单元格
       */
      remove1() {
        this.sheet.removeSpan(5, 2)
      }
    }
  }
</script>
<style scoped>
.sheet-desinger-wrap{
  width:100%;
  height:98%;
  position: relative;
}
.operate-wrap{
  position: absolute;
  width:20%;
  right:0;
  top:0;
  height:100%;
  border:1px solid grey;
  border-radius: 4px;
  padding: 0 20px;
  box-sizing: border-box;
  cursor: pointer;
}
.operate-wrap>p{
  border:1px solid grey;
  border-radius: 4px;
  padding: 0 4px;
}
.operate-wrap>p:hover{
  border:1px solid lightseagreen;
  color:mediumaquamarine;
}
</style>