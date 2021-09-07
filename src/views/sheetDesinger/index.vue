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
      <br />
      <input type="color" @change="colorChange">
      <p class="btn-operate" @click="setStyle">D列单元格样式</p>
      <p class="btn-operate">
        <input type="checkbox" @change="headerCol" />表头单元格操作
      </p>
      <p class="btn-operate" @click="isLock">单元格A1是否被锁</p>
      
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
        sheet: null,
        // 单元格背景色
        backColor: '#fff',
      };
    },
    methods: {
      designerInitialized(value) {
        this.designer = value;
        this.spread = value.getWorkbook()
        this.sheet = this.spread.getActiveSheet()  
        console.log('表格是否处于编辑状态：', this.sheet.endEdit());
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
      },
      /**
       * 设置单元格样式
       */
      setStyle() {
        this.sheet.getCell(1,1).backColor('rgb(0,0,0)')
        this.sheet.getRange(-1, 3, -1, 1, GC.Spread.Sheets.SheetArea.viewport).backColor(this.backColor);
      },
      colorChange(e) {
        this.backColor = e.target.value
      },
      /**
       * 表头单元格合并和赋值
       */
      headerCol(e) {
        if (e.target.checked) {
          this.sheet.setValue(0,6,"test6",GC.Spread.Sheets.SheetArea.colHeader); // 给列头单元格赋值
          this.sheet.addSpan(0,0,3,3,GC.Spread.Sheets.SheetArea.colHeader); // 合并列头单元格
        } else {  
          this.sheet.setValue(0,6,"G",GC.Spread.Sheets.SheetArea.colHeader); // 给列头单元格赋值
          this.sheet.removeSpan(0, 0)
        }
      },
      /**
       * 获取单元格是否被锁
       * 
       */
      isLock() {
        let lock = this.spread.getActiveSheet().getCell(1, 1).locked()
        alert(lock)
      }
    }
  }
</script>
<style>
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