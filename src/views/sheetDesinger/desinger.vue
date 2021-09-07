<template>
  <div class="sheet-desinger-wrap">
    <gc-spread-sheets-designer :styleInfo='styleInfo' :config="config" :spreadOptions="spreadOptions" @designerInitialized='designerInitialized'>
    </gc-spread-sheets-designer>
    <div class="operate-wrap">
      
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
        /**格式刷相关 */
        isFormatPainting: false,
        fromRange: false,
        fromSheet: false,
      };
    },
    methods: {
      designerInitialized(value) {
        this.designer = value;
        this.spread = value.getWorkbook()
        // this.selectionChanged(this.spread)
        this.initConfig(this.spread)
        this.setShortKey()
        
      },
      resetFormatPainting() {
          this.isFormatPainting = false; 
      },
      initConfig(spread) {
        /**
         * execute对应具体执行内容的function,也就是 load 和 update 方法。
          iconClass为按钮样式，可以制定按钮图片
          text为按钮显示文字
          commandName为命令名称，需要全局唯一
         */
        // 注册了 Welcome /brush 两个命令。
        let that = this
        let commandMap = {
          Welcome: {
            title: "Welcome",
            iconClass: "ribbon-button-welcome",
            commandName: "Welcome",
            execute: async (context, propertyName, fontItalicChecked) => {
              alert('Welcome to new designer.');
            }
          },


          brush: {
            title: "brush",
            iconClass: "ribbon-button-brush",
            commandName: "brush",
            execute: async (context, propertyName, fontItalicChecked) => {
              let spread = context.getWorkbook();
              var sheet = spread.getActiveSheet();
              

              var selectionRange = sheet.getSelections();
              if (selectionRange.length > 1) {
                alert("无法对多重选择区域执行此操作");
                return;
              }
              
              if (that.isFormatPainting) {
                that.resetFormatPainting();
                return;
              }
              that.fromRange = selectionRange[0];
              that.fromSheet = sheet;
              that.isFormatPainting = true;
            }
          },
        }
        let brushCommandGroup = {
            label: "新设计器",
            thumbnailClass: "ribbon-thumbnail-brush",
            commandGroup: {
                children: [
                    {
                        direction: "vertical",
                        commands: [
                            "Welcome",
                            "brush"
                        ]
                    }
                ]
            }
        };
        this.config.ribbon[0].buttonGroups.unshift(brushCommandGroup);
        this.$set(this.config, 'commandMap', commandMap)
        this.selectionChanged(spread)
      },
      /**
       * 格式刷 
       */
      selectionChanged(spread) {
        let that = this
          spread.bind(GC.Spread.Sheets.Events.SelectionChanged, function(e, info) {
          let fromRange = that.fromRange
          if (that.isFormatPainting) {
            let sheet = spread.getActiveSheet();
            that.resetFormatPainting();
            sheet.isPaintSuspended(true);
            let toRange = sheet.getSelections()[0];

          
            //toRange biger than fromRange
            if (fromRange.rowCount > toRange.rowCount) {
              toRange.rowCount = fromRange.rowCount;
            }
            if (fromRange.colCount > toRange.colCount) {
              toRange.colCount = fromRange.colCount;
            }
            //toRange must in Sheet
            if (toRange.row + toRange.rowCount > sheet.getRowCount()) {
              toRange.rowCount = sheet.getRowCount() - toRange.row;
            }
            if (toRange.col + toRange.colCount > sheet.getColumnCount()) {
              toRange.colCount = sheet.getColumnCount() - toRange.col;
            }

            let rowStep = fromRange.rowCount,
              colStep = fromRange.colCount;
            let endRow = toRange.row + toRange.rowCount - 1,
              endCol = toRange.col + toRange.colCount - 1;

            // if toRange bigger than fromRange, repeat paint
            for (let startRow = toRange.row; startRow <= endRow; startRow = startRow + rowStep) {
              for (let startCol = toRange.col; startCol <= endCol; startCol = startCol + colStep) {

                let rowCount = startRow + rowStep > endRow + 1 ? endRow - startRow + 1 : rowStep;
                let colCount = startCol + colStep > endCol + 1 ? endCol - startCol + 1 : colStep;
                // sheet.copyTo(fromRange.row,fromRange.col, startRow, startCol, rowCount, colCount,GC.Spread.Sheets.CopyToOptions.style | GC.Spread.Sheets.CopyToOptions.span);
                let fromRanges = new GC.Spread.Sheets.Range(fromRange.row, fromRange.col, rowCount, colCount);
                let pastedRange = new GC.Spread.Sheets.Range(startRow, startCol, rowCount, colCount);
                spread.commandManager().execute({
                  cmd: "clipboardPaste",
                  sheetName: sheet.name(),
                  fromSheet: that.fromSheet,
                  fromRanges: [fromRanges],
                  pastedRanges: [pastedRange],
                  isCutting: false,
                  clipboardText: "",
                  pasteOption: GC.Spread.Sheets.ClipboardPasteOptions.formatting
                });
              }
            }

            sheet.isPaintSuspended(false);
          }
       	})
      },
      /**
       * 快捷键
       * register：向命令管理器注册命令，第二个参数是“定义命令的对象。”
       * 若存在可以直接使用 GC.Spread.Sheets.Commands
       */
      setShortKey() {
        let spreadNW = this.spread
        let Key = GC.Spread.Commands.Key
        let commandManager = spreadNW.commandManager()
        // ctrl + left键默认找到左侧的有值的单元格，若没有回到*0(即当前行的第一列)
        commandManager.register(
          'leftValue',
          () => {
            let sheet = spreadNW.getActiveSheet()
            let rowIndex = sheet.getActiveRowIndex()
            let colIndex = sheet.getActiveColumnIndex()
            // 从活动单元的前一个单元格出发，直至当前行的第一个单元格
            for(let i = colIndex - 1; i >= 0; i--) {
              let left = sheet.getValue(rowIndex, i)
              if(left) {
                sheet.setActiveCell(rowIndex, i)
                break
              }
            }
            return true
          },
          Key.left, true, false, false,false
        )
        commandManager.register(
          'rightValue',
          () => {
            let sheet = spreadNW.getActiveSheet()
            let rowIndex = sheet.getActiveRowIndex()
            let colIndex = sheet.getActiveColumnIndex()
            let colCount = sheet.getColumnCount()
            // 从活动单元的前一个单元格出发，直至当前行的第一个单元格
            for(let i = colIndex + 1; i <= colCount; i++) {
              let left = sheet.getValue(rowIndex, i)
              if(left) {
                sheet.setActiveCell(rowIndex, i)
                break
              }
            }
            return true
          },
          Key.right, true, false, false,false
        )
        // 选中表单全部内容
        commandManager.register(
          'selectAll',
          () => {
            spreadNW.getActiveSheet().setSelection(-1, -1, -1, -1)
            return true
          },
          Key.a, true, false, false,false
        )
      },
      /**
       * 赋值高度
       */
      setHeight(value) {
        this.styleInfo.height = value
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

</style>