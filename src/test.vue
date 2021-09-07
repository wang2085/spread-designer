<template>
  <div id="app">
    <gc-spread-sheets-designer :styleInfo='styleInfo' :config='config' @designerInitialized='designerInitialized'>
    </gc-spread-sheets-designer>
    <div class="sample-panel">
            <div id="panel"></div>
        </div>
  </div>
</template>

<script>

  import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css'
  import '@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css'
  import GC from '@grapecity/spread-sheets';
  import "@grapecity/spread-sheets-pivot-addon";
  import '@grapecity/spread-sheets-pivot-addon/dist/gc.spread.pivot.pivottables.min.js'
  import '@grapecity/spread-sheets-resources-zh';
  GC.Spread.Common.CultureManager.culture("zh-cn");
  import '@grapecity/spread-sheets-designer-resources-cn';
  // import "./custom.css"
 
  import { Designer } from '@grapecity/spread-sheets-designer-vue'
  import { pivotSales } from './data.js'

  export default {
    name: 'App',
    data: function () {
    var config = GC.Spread.Sheets.Designer.DefaultConfig;
    // config.commandMap = {
    //   Welcome: {
    //     title: "Welcome",
    //     text: "Welcome",
    //     iconClass: "ribbon-button-welcome",
    //     bigButton: "true",
    //     commandName: "Welcome",
    //     execute: async (context, propertyName, fontItalicChecked) => {
    //       alert("Welcome to new designer.");
    //     },
    //   },
    // };
    // config.ribbon[0].buttonGroups.unshift({
    //   label: "NewDesigner",
    //   thumbnailClass: "welcome",
    //   commandGroup: {
    //     children: [
    //       {
    //         direction: "vertical",
    //         commands: ["Welcome"],
    //       },
    //       // This is custom button ----------------end-------------
    //     ],
    //   },
    // });
      return {
        styleInfo: { height: "98vh", width: '100%' },
        config: config,
        spreadOptions: {
          // sheetCount: 2,
        },
        designer: null,
        spread: null,
      };
    },
    methods: {
      designerInitialized(value) {
        console.log('===========', GC.Spread.Sheets.Designer.DefaultConfig)
        this.designer = value;
        // this.spread = value.getWorkbook()
        // this.initSpread(this.spread)

      },
      initSpread: function (spread) {
            this.initSheets(spread);
            let pivotLayoutSheet = spread.getSheet(0);
            this.initPivotTable(pivotLayoutSheet);
        },
        initSheets: function (spread) {
            spread.suspendPaint();
            let sheet = spread.getSheet(1);
            sheet.setRowCount(117);
            sheet.setColumnWidth(0, 120);
            sheet.getCell(-1, 0).formatter("YYYY-mm-DD");
            sheet.getRange(-1,4,0,2).formatter("$ #,##0");
            sheet.setArray(0, 0, pivotSales);
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
          console.log('2222222222222', sheet.pivotTables)
            let myPivotTable = sheet.pivotTables.add("myPivotTable", "tableSales", 1, 1, GC.Spread.Pivot.PivotTableLayoutType.outline, GC.Spread.Pivot.PivotTableThemes.light8);
            myPivotTable.suspendLayout();
            myPivotTable.options.showRowHeader = true;
            myPivotTable.options.showColumnHeader = true;
            myPivotTable.add("salesperson", "Salesperson", GC.Spread.Pivot.PivotTableFieldType.rowField);
            myPivotTable.add("car", "Cars", GC.Spread.Pivot.PivotTableFieldType.rowField);
            myPivotTable.add("date", "Date", GC.Spread.Pivot.PivotTableFieldType.columnField);
            let groupInfo = { originFieldName: "date", dateGroups: [{ by: GC.Pivot.DateGroupType.quarters }] };
            myPivotTable.group(groupInfo);
            myPivotTable.add("total", "Totals", GC.Spread.Pivot.PivotTableFieldType.valueField, GC.Pivot.SubtotalType.sum);
            // let panel = new GC.Spread.Pivot.PivotPanel("myPivotPanel", myPivotTable, document.getElementById("panel"));
            // let dom = $(".right-panels > .gc-sidePanel-item:last")
            // dom.removeClass("hidden")
            let parentDom = document.getElementsByClassName('right-panels')[0]
            // console.log(parentDom.lastElementChild, parentDom.lastChild)
            let childDom = parentDom.lastElementChild
            
            childDom.classList.remove("hidden")
            console.log(childDom)
            let panel = new GC.Spread.Pivot.PivotPanel("myPivotPanel", myPivotTable, document.getElementById("gc-designer-pivot-table-panel"));
            panel.sectionVisibility(GC.Spread.Pivot.PivotPanelSection.fields + GC.Spread.Pivot.PivotPanelSection.area);
            myPivotTable.resumeLayout();
            // myPivotTable.autoFitColumn();
            // childDom.classList.remove("hidden")
            console.log('0000000000000000', GC.Spread.Sheets.Designer.DefaultConfig)
        }
    }
  }
</script>
<style>
</style>