<template>
  <div class="sheet-desinger-wrap">
    <gc-spread-sheets-designer :styleInfo='styleInfo' :spreadOptions="spreadOptions" @designerInitialized='designerInitialized'>
      
    </gc-spread-sheets-designer>
    <div class="operate-wrap">
      <p class="btn-operate">
        <input type="checkbox" @change="deleteBlock">去除空白部分
      </p>
      <p class="btn-operate">
        <input type="checkbox" @change="addBackColor">添加背景色
      </p>
      <p class="btn-operate">
        <input type="checkbox" @change="addBackImg">添加背景图片
      </p>
      <div class="btn-operate">
        <input type="file" name="files[]" id="fileDemo" accept=".xlsx,.xls" />
        <input type="button" id="loadExcel" value="Import" @click="ImportFileStart()" />
        <div id="sheetSelection" style="display:none;margin:4px 0;">
            <p style="display:inline">Select sheet to load: </p>
            <select id="sheetSelect" style="display:inline" @change="copySheet"></select>
        </div>
      </div>
      
    </div>
    <div class="spread-cell-dialog"  id="spreadjs-dialog-id">
      <div v-for="(item, index) in dialogTexts" :key="'cell-dialog-' + index" class="spread-cell-dialog-line">
        <p @click="fillCellText(item)"> {{item}}</p>
      </div>
    </div>
  </div>
</template>

<script>

  
  import GC from '@grapecity/spread-sheets';
  import * as ExcelIO from '@grapecity/spread-excelio';
  // import { Designer } from '@grapecity/spread-sheets-designer-vue'

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
        // 选中文件
        sheetFiles: {},
        isbackImg: false,
        // 单元格内容填充
        curCell: {},
        dialogTexts: []
      };
    },
    methods: {
      designerInitialized(value) {
        this.designer = value;
        this.spread = value.getWorkbook()
        this.sheet = this.spread.getActiveSheet()

        this.getCellValue(this.spread)
      },
      /**
       * 填充表单数据
       */
      fillCellText(text) {
        console.log('=============', text);
        let sheet = this.spread.getActiveSheet()
        let { row, col } = this.curCell
        sheet.setValue(row, col, text)
        document.getElementById('spreadjs-dialog-id').style.visibility = 'hidden'
      },
      /**
       * 单元格内容快速填充
       */
      getCellValue(spread) {
       let that = this
        
        spread.bind(GC.Spread.Sheets.Events.EditChange, function (e, info) {
          let wrap = document.getElementById('spreadjs-dialog-id')
          let text = info.editingText ? info.editingText.trim() : ''
          
          wrap.style.visibility = 'hidden'
          if(text && text.length){
            that.dialogTexts = that.filterData(text)
              if(that.dialogTexts && that.dialogTexts.length) {
                that.curCell = {
                  row: info.row,
                  col: info.col
                }
                let { width, x, y } = info.sheet.getCellRect(info.row, info.col)
                
                if (wrap) {
                  wrap.style.visibility = 'visible'
                  wrap.style.width = width + 'px'
                  wrap.style.top = y + 212 + 'px'
                  wrap.style.left = x + 'px'
                }
                
              }
          } else {
            // wrap.style.visibility = 'hidden'
          }
          spread.bind(GC.Spread.Sheets.Events.CellClick, () => {
            let wrap = document.getElementById('spreadjs-dialog-id')
            wrap && (wrap.style.visibility = 'hidden')
          })
          spread.bind(GC.Spread.Sheets.Events.SheetTabClick, function (e, info) {
            let wrap = document.getElementById('spreadjs-dialog-id')
            wrap && (wrap.style.visibility = 'hidden')
          });
        });
      },
      /**
       * 过滤数据
       */
      filterData(text) {
         // 默认内容
        let sourceData = [
          '广发银行',
          '北京银行',
          '农业银行',
          '建设银行',
          '邮政银行',
          '民生银行',
        ]
        let result = []
        sourceData.forEach(item => {
          (item.indexOf(text) > -1) && result.push(item)
        })
        return result
      },
      /**
       * 去除右侧和底部的空白部分
       */
      deleteBlock(e) {
        this.spread.options.scrollbarMaxAlign = e.target.checked;
        // this.spread.options.scrollbarShowMax = e.target.checked;
      },
      /**
       * 导入Excel文件
       */
      ImportFileStart() {
        let excelIO = new ExcelIO.IO()
        var excelFile = document.getElementById("fileDemo").files[0];
        let that = this
        excelIO.open(excelFile, json => {
          that.sheetFiles = json.sheets
            // that.spread.fromJSON(json);
            that.CreateSheetSelect();

        }, err => {
          console.log('excelIO获取文件失败：',err);
        });
      },
      // 生成导入文件的右侧select
      CreateSheetSelect() {
        let keys = Object.keys(this.sheetFiles)
        let sheetSelectionDiv = document.getElementById('sheetSelection');
        sheetSelectionDiv.style.display = "block";
        let dropDown = document.getElementById('sheetSelect');
        for (let s = 0; s < keys.length; s++) {
            dropDown.options[dropDown.options.length] = new Option(keys[s], s);
        }     
      },
      /**
       * file生成
       */
      copySheet() {
        
        let idx = document.getElementById('sheetSelect').value;
        let keys = Object.keys(this.sheetFiles)
        let name = keys[idx]

        let spread = this.spread
        spread.removeSheet(0);
        spread.addSheet();
        spread.suspendPaint();
        // hiddenWorkbook.getNamedStyles().forEach(function (namedStyle) {
        //     spread.addNamedStyle(namedStyle);
        // })
        spread.getSheet(0).fromJSON(this.sheetFiles[name]);
        spread.resumePaint();
      },
      /**
       * 添加背景
       */
      addBackColor(e) {
        if (this.isbackImg && e.target.checked) {
          alert('已经设置了背景图片，背景色不起作用！')
        }
        if (e.target.checked) {
          this.spread.options.backColor = 'rgb(104,104,104)';
        } else {
          this.spread.options.backColor = ''
        }
        
        // this.spread.resumePaint();
      },
      addBackImg(e) {
        this.isbackImg = e.target.checked
        if (e.target.checked) {
          // stretch center zoom none
          this.spread.options.backgroundImageLayout = GC.Spread.Sheets.ImageLayout.stretch;  
          this.spread.options.backgroundImage = 'data:image/jpg;base64,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+1G32qTbRtouFiPb7UbfapNtG2i4WI9vtRt9qk20baLhYj2+1G32qTbRtouFiPb7UbfapNtG2i4WI9vtRt9qk20baLhYj2+1G32qTbRtouFiPb7UbfapNtG2i4WI9vtRt9qk20baLhYj2+1G32qTbRtouFiPb7UbfapNtG2i4WI9vtRt9qk20baLhYj2+1G32qTbRtouFiPb7UbfapNtG2i4WI9vtRt9qk20baLhYj2+1G32qTbRtouFiPb7UbfapNtG2i4WI9vtRt9qk20baLhYj2+1G32qTbRtouFiPb7UbfapNtG2i4WI9vtRt9qk20baLhYj2+1G32qTbRtouFiPb7UbfapNtG2i4WI9vtRt9qk20baLhYj2+1G32qTbRtouFiPb7UbfapNtG2i4WI9vtX54/G07f2i/ioP+opZf+mmwr9Ettfnb8bjt/aO+Ko/6idj/AOmiwrtwj/eHPXVon6L7aNtP20ba8y51WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGbaNtP20baLhYZto20/bRtouFhm2jbT9tG2i4WGba/Oj45f8AJyHxW/7Cdj/6aLCv0a21+cvx0OP2kfit/wBhOx/9NFhXpYD+N8jnr/wz9HcCjAp+BRgV5NzrsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwKMCn4FGBRcLDMCjAp+BRgUXCwzAowKfgUYFFwsMwK/OH48HH7SfxW/wCwnY/+miwr9IcCvzd+Pv8Aycr8Vv8AsJ2P/posK9TLXev8mcuJX7s/SWinbaNteRc7BtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtFO20baLgNop22jbRcBtfmz8fjj9pb4rf9hOx/9NFhX6Uba/Nb9oE4/aX+K/8A2E7H/wBNFhXrZY/3/wAmcmJ/hn6V7aNtOoryDrG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7aNtOooAbto206igBu2jbTqKAG7a/NP9oPj9pn4r8/8xOx/9NFhX6XV+Z/7Q/8Ayc18V/8AsJ2P/posK9bLP4/yZy4r+Gj9MKKdRXj3OwbRTqKLgNop1FFwG0U6ii4DaKdRRcBtFOoouA2inUUXAbRTqKLgNop1FFwG0U6ii4DaKdRRcBtFOoouA2inUUXAbRTqKLgNop1FFwG0U6ii4DaKdRRcBtFOoouA2inUUXAbRTqKLgNop1FFwG0U6ii4DaKdRRcBtFOoouA2inUUXAbRTqKLgNop1FFwG0U6ii4DaKdRRcBtFOoouA2inUUXAbRTqKLgNop1FFwG0U6ii4DaKdRRcBtFOoouA2inUUXAbRTqKLgNop1FFwG0U6ii4DaKdRRcBtFOoouA2inUUXAbRTqKLgNop1FFwG0U6ii4DaKdRRcBtFOoouA2inUUXAbX5n/tDf8AJzXxW/7Cdj/6aLCv0yr8y/2if+TnPiv/ANhKw/8ATRYV6+Vv/aPkzjxXwH6aUUUV452BRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAB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yhcseZR5lV959aN59aOULljzKPMqvvPrRvPrRyhcseZR5lV959aN59aOULljzKPMqvvPrRvPrRyhcseZR5lV959aN59aOULljzKPMqvvPrRvPrRyhcseZR5lV959aN59aOULljzKPMqvvPrRvPrRyhcseZR5lV959aN59aOULljzKPMqvvPrRvPrRyhcseZR5lV959aN59aOULljzKPMqvvPrRvPrRyhcseZR5lV959aN59aOULljzKPMqvvPrRvPrRyhcseZR5lV959aN59aOULljzKPMqvvPrRvPrRyhcseZR5lV959aN59aOULljzKPMqvvPrRvPrRyhcseZR5lV959aN59aOULljzK/PT48Df+0R8Sz/ANP9l/6a7Ov0D3n1r8+/jqN37QfxJP8A0/2f/pss60pq01/XQmTvFn35u+lG76VDv96N/vWvKZ3Jt30o3fSod/vRv96OULk276UbvpUO/wB6N/vRyhcm3fSjd9Kh3+9G/wB6OULk276UbvpUO/3o3+9HKFybd9KN30qHf70b/ejlC5Nu+lG76VDv96N/vRyhcm3fSjd9Kh3+9G/3o5QuTbvpRu+lQ7/ejf70coXJt30o3fSod/vRv96OULk276UbvpUO/wB6N/vRyhcm3fSjd9Kh3+9G/wB6OULk276UbvpUO/3o3+9HKFybd9KN30qHf70b/ejlC5Nu+lG76VDv96N/vRyhcm3fSjd9Kh3+9G/3o5QuTbvpRu+lQ7/ejf70coXJt30o3fSod/vRv96OULk276UbvpUO/wB6N/vRyhcm3fSjd9Kh3+9G/wB6OULk276UbvpUO/3o3+9HKFybd9KN30qHf70b/ejlC5Nu+lG76VDv96N/vRyhcm3fSjd9Kh3+9G/3o5QuTbvpRu+lQ7/ejf70coXJt30o3fSod/vRv96OULk276UbvpUO/wB6N/vRyhcm3fSjd9Kh3+9G/wB6OULk276UbvpUO/3o3+9HKFybd9KN30qHf70b/ejlC5Nu+lG76VDv96N/vRyhcm3fSjd9Kh3+9G/3o5QuTbvpRu+lQ7/ejf70coXJt30o3fSod/vRv96OULk276UbvpUO/wB6N/vRyhcm3fSjd9Kh3+9G/wB6OULk276UbvpUO/3o3+9HKFybd9KN30qHf70b/ejlC5Nu+lG76VDv96N/vRyhcm3fSjd9Kh3+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'
        } else {
          this.spread.options.backgroundImage =''
        }
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
.spread-cell-dialog{
  visibility:hidden;
  position: absolute;
  font-size: 12px;
  background: #fff;
  border:1px #C0C0C0 solid;
  box-shadow: 1px 2px 5px rgba(0,0,0,0.4);
  z-index: 9999999;
}
.spread-cell-dialog p{
  margin: 0;
  padding: 4px;
  cursor: pointer;
}
.spread-cell-dialog-line:hover{
  background: rgba(138,226,137,0.3);
}
</style>