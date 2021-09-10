<template>
  <div class="pivot-table-wrap">
    <gc-spread-sheets-designer :styleInfo='styleInfo' :spreadOptions="spreadOptions" @designerInitialized='designerInitialized'>
    </gc-spread-sheets-designer>
  </div>
</template>

<script>

  
  import GC from '@grapecity/spread-sheets';
  import { Designer } from '@grapecity/spread-sheets-designer-vue'
  import { pivotData } from './data.js'

  export default {
    name: 'PivotTable',
    data: function () {
    var config = GC.Spread.Sheets.Designer.DefaultConfig;
      return {
        styleInfo: { height: "100%", width: '100%' },
        config: config,
        spreadOptions: {
          sheetCount: 2,
        },
        designer: null,
        spread: null,
      };
    },
    methods: {
      designerInitialized(value) {
        this.designer = value;
        this.spread = value.getWorkbook()
        this.initSpread(this.spread)

      },
      initSpread: function (spread) {
            this.initSheets(spread);
            let pivotLayoutSheet = spread.getSheet(0);
            this.initPivotTable(pivotLayoutSheet);
        },
        initSheets: function (spread) {
            spread.suspendPaint();
            let sheet = spread.getSheet(1);
            sheet.name("DataSource");
            sheet.setRowCount(117);
            sheet.setColumnWidth(0, 120);
            sheet.getCell(-1, 0).formatter("YYYY-mm-DD");
            sheet.getRange(-1,4,0,2).formatter("$ #,##0");
            sheet.setArray(0, 0, pivotData);
            let table = sheet.tables.add('tableSales', 0, 0, 117, 6);
            for(let i=2;i<=117;i++)
            {
              sheet.setFormula(i-1,5,'=D'+i+'*E'+i)
            }
            table.style(GC.Spread.Sheets.Tables.TableThemes["none"]);
            let sheet0 = spread.getSheet(0);
            sheet0.name("PivotLayout");
            spread.resumePaint();
        },
        
        initPivotTable: function (sheet) {
            let myPivotTable = sheet.pivotTables.add("myPivotTable", "tableSales", 1, 1, GC.Spread.Pivot.PivotTableLayoutType.outline, GC.Spread.Pivot.PivotTableThemes.medium2);
            myPivotTable.suspendLayout();
            myPivotTable.options.showRowHeader = true;
            myPivotTable.options.showColumnHeader = true;
            myPivotTable.add("salesperson", "Salesperson", GC.Spread.Pivot.PivotTableFieldType.rowField);
            myPivotTable.add("car", "Cars", GC.Spread.Pivot.PivotTableFieldType.rowField);
            myPivotTable.add("date", "Date", GC.Spread.Pivot.PivotTableFieldType.columnField);
            let groupInfo = { originFieldName: "date", dateGroups: [{ by: GC.Pivot.DateGroupType.quarters }] };
            myPivotTable.group(groupInfo);
            myPivotTable.add("total", "Totals", GC.Spread.Pivot.PivotTableFieldType.valueField, GC.Pivot.SubtotalType.sum);
            myPivotTable.addCalcField("PercentOfEach", "=Amount/454");
            // let panel = new GC.Spread.Pivot.PivotPanel("myPivotPanel", myPivotTable, document.getElementById("panel"));
            // let dom = $(".right-panels > .gc-sidePanel-item:last")
            // dom.removeClass("hidden")
            // let parentDom = document.getElementsByClassName('right-panels')[0]
            // console.log(parentDom.lastElementChild, parentDom.lastChild)
            // let childDom = parentDom.lastElementChild
            
            // childDom.classList.remove("hidden")
            // console.log(childDom)
            // let panel = new GC.Spread.Pivot.PivotPanel("myPivotPanel", myPivotTable, document.getElementById("gc-designer-pivot-table-panel"));
            // panel.sectionVisibility(GC.Spread.Pivot.PivotPanelSection.fields + GC.Spread.Pivot.PivotPanelSection.area);
            myPivotTable.resumeLayout();
            myPivotTable.autoFitColumn();

            
            // let myPivotTable1 = sheet.pivotTables.add("myPivotTable1", "tableSales", 100, 1, GC.Spread.Pivot.PivotTableLayoutType.outline, GC.Spread.Pivot.PivotTableThemes.light8);
            // myPivotTable1.suspendLayout();
            // myPivotTable1.options.showRowHeader = true;
            // myPivotTable1.options.showColumnHeader = true;
            // myPivotTable1.add("salesperson", "Salesperson", GC.Spread.Pivot.PivotTableFieldType.rowField);
            // myPivotTable1.add("car", "Cars", GC.Spread.Pivot.PivotTableFieldType.rowField);
            // myPivotTable1.add("date", "Date", GC.Spread.Pivot.PivotTableFieldType.columnField);
            // myPivotTable1.group(groupInfo);
            // myPivotTable1.add("total", "Totals", GC.Spread.Pivot.PivotTableFieldType.valueField, GC.Pivot.SubtotalType.sum);
            // myPivotTable1.resumeLayout();
            // myPivotTable1.autoFitColumn();
        }
    }
  }
</script>
<style scoped>
.pivot-table-wrap{
  width:100%;
  height:98%;
}
</style>