<template>
  <div class="pivot-table-wrap">
    <gc-spread-sheets-designer
      :styleInfo="styleInfo"
      :spreadOptions="spreadOptions"
      @designerInitialized="designerInitialized"
    >
    </gc-spread-sheets-designer>
  </div>
</template>

<script>
import GC from "@grapecity/spread-sheets";
import { Designer } from "@grapecity/spread-sheets-designer-vue";
import { sourceData } from "./data.js";

export default {
  name: "PivotTable",
  data: function() {
    var config = GC.Spread.Sheets.Designer.DefaultConfig;
    return {
      styleInfo: { height: "100%", width: "100%" },
      config: config,
      spreadOptions: {
        sheetCount: 3
      },
      designer: null,
      spread: null,
      p_t: null
    };
  },
  methods: {
    designerInitialized(value) {
      this.designer = value;
      this.spread = value.getWorkbook();
      this.initSpread(this.spread);
      let that = this;
      this.spread.bind(GC.Spread.Sheets.Events.SheetTabClick, function(
        e,
        info
      ) {
        console.log(info.sheetName, info.sheetName == "PivotLayout", that.p_t);
        if (info.sheetName == "PivotLayout" && that.p_t) {
          that.p_t.updateSource();
        }
      });
    },
    initSpread: function(spread) {
      this.initSheets(spread);
      let pivotLayoutSheet = spread.getSheet(0);
      this.initPivotTable(pivotLayoutSheet);
    },
    initSheets: function(spread) {
      spread.suspendPaint();
      let sheet = spread.getSheet(1);
      sheet.name("DataSource");
      sheet.setRowCount(117);
      sheet.setColumnWidth(0, 120);
      sheet.getCell(-1, 0).formatter("YYYY-mm-DD");
      sheet.getRange(-1, 4, 0, 2).formatter("$ #,##0");
      sheet.setArray(0, 0, sourceData);
      let table = sheet.tables.add("tableSales", 0, 0, 8, 4);
      table.style(GC.Spread.Sheets.Tables.TableThemes["none"]);
      let sheet0 = spread.getSheet(0);
      sheet0.name("PivotLayout");
      spread.resumePaint();
    },

    initPivotTable: function(sheet) {
      var layout = GC.Spread.Pivot.PivotTableLayoutType.compact;
      var theme = GC.Spread.Pivot.PivotTableThemes.medium2;
      var options = { showRowHeader: true, showColumnHeader: true };
      var pivotTable = sheet.pivotTables.add(
        "pivotTable_1",
        "tableSales",
        1,
        1,
        layout,
        theme,
        options
      );
      this.groupTable(pivotTable);
      //   this.pivotAreaToSheetRanges(pivotTable);
      pivotTable.layoutType(GC.Spread.Pivot.PivotTableLayoutType.outline);
      pivotTable.autoFitColumn();
      sheet.resumePaint();
    },
    groupTable(pivotTable) {
      var groupInfo = {
        originFieldName: "Buyer",
        textGroup: {
          fieldName: "FamilyMembers",
          groupItems: {
            parent: ["Mom", "Dad"],
            children: ["David", "Kelly"]
          }
        }
      };
      /**
       * 透视表分组
       *
       */
      pivotTable.group(groupInfo);
      pivotTable.add(
        "FamilyMembers",
        "FamilyMembers",
        GC.Spread.Pivot.PivotTableFieldType.rowField
      );
      pivotTable.add(
        "Buyer",
        "Buyer",
        GC.Spread.Pivot.PivotTableFieldType.columnField
      );
      pivotTable.add(
        "Amount",
        "Sum of Amount",
        GC.Spread.Pivot.PivotTableFieldType.valueField,
        GC.Pivot.SubtotalType.sum
      );
      //   pivotTable.remove("FamilyMembers");
      /**
       * 透视表位置变动
       */
      //   var toSheet = this.spread.getSheet(2);
      //   pivotTable.position(10, 10, toSheet.name());
      /**
       * 筛选选中的值
       */
      //   var condition = {
      //     conType: GC.Pivot.PivotConditionType.caption,
      //     operator: GC.Pivot.PivotCaptionFilterOperator.contains,
      //     val: ["Mom"]
      //   };
      //   var filterInfo = { condition };
      //   pivotTable.labelFilter("Buyer", filterInfo);
      // 获取或设置数据透视表的布局类型
      //   var pivotTableLayoutType = GC.Spread.Pivot.PivotTableLayoutType.outline;
      //   pivotTable.layoutType(pivotTableLayoutType);

      this.p_t = pivotTable;
      console.log("222222222", this.p_t);
    },
    pivotAreaToSheetRanges(pivotTable) {
      pivotTable.add(
        "Buyer",
        "Buyer",
        GC.Spread.Pivot.PivotTableFieldType.rowField
      );
      pivotTable.add(
        "Type",
        "Type",
        GC.Spread.Pivot.PivotTableFieldType.rowField
      );
      pivotTable.add(
        "Date",
        "Date",
        GC.Spread.Pivot.PivotTableFieldType.columnField
      );
      pivotTable.add(
        "Amount",
        "Amount",
        GC.Spread.Pivot.PivotTableFieldType.valueField,
        GC.Pivot.SubtotalType.sum
      );
      var pivotArea = {
        dataOnly: true,
        references: [
          {
            fieldName: "Buyer",
            items: ["Mom", "Dad"]
          }
        ]
      };
      pivotTable.pivotAreaToSheetRanges(pivotArea);
    }
  }
};
</script>
<style scoped>
.pivot-table-wrap {
  width: 100%;
  height: 98%;
}
</style>
