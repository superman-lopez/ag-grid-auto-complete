import { Component, AfterViewInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';


@Component({
    selector: 'auto-complete',
    encapsulation: ViewEncapsulation.None,
    //Can we pull the styles for the input field from params.eGridCell?
    styles: [`
    .ag-theme-balham .ag-popup-editor {
        background-color: transparent;
        position: absolute;
        user-select: none;
        padding: 0px;
        border: none;
        height: 500px;
    }
    .auto-complete-input-field-balham {
        outline: initial;
        padding-top: 0px;
        padding-right: 0px;
        padding-bottom: 0px;
        padding-left: 0px;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
        height: 28px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
        font-weight: 400;
        font-size: 12px;
    }`],
    template: ` 
    <div (keydown)="onKeydown($event)">
    <input 
        #input
        [(ngModel)]="inputValue"
        class="auto-complete-input-field-balham" 
        [style.width]="params.column.actualWidth + 'px'">
    <ag-grid-angular
        style="width: 450px; max-height: 200px; font-weight: 200;" 
        class="ag-theme-balham"
        [rowData]="rowData" 
        [columnDefs]="columnDefs"
        [headerHeight]="0"
        [rowSelection]="rowSelection"
        (gridReady)="onGridReady($event)"
        (rowClicked)="rowClicked($event)"
        >
    </ag-grid-angular>
    </div>
    `
})
export class AutoCompleteComponent implements ICellEditorAngularComp, AfterViewInit {
    // variables for agGrid
    private params: any;
    private gridApi: any;
    private rowData: any;
    private columnDefs: any;
    private rowSelection: string = 'single';
    // variables for component
    private cellValue: string;
    private filteredRowData: any;
    private inputValue: string;
    private propertyName: string;
    private isCanceled: boolean = true;
    private selectedObject: any = {
      }

    @ViewChild("input") input: ElementRef;

 
    // below puts focus in input field at start of cellEditor, or selects if field had a previous value
    ngAfterViewInit() {
        window.setTimeout(() => {
            if (this.inputValue == this.cellValue) {
                this.input.nativeElement.select();
            } else {
                this.input.nativeElement.focus();
            }
        })
        
    }
    // ICellEditorAngularComp functions
    agInit(params: any): void {
        this.params = params;

        this.rowData = params.rowData;
        this.columnDefs = params.columnDefs;
        this.propertyName = params.propertyRendered;
        this.cellValue = params.value[this.propertyName];

        if (!params.charPress) {
            if(this.cellValue) this.inputValue = this.cellValue;
        } else {
            this.inputValue = params.charPress;
        }
    }

    getValue(): any {
        return this.selectedObject;
    }
    isPopup(): boolean {
        return true;
    }
    isCancelAfterEnd(): boolean {
        return this.isCanceled
    }

    // ag-Grid functions
    onGridReady(params) {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
    }
    
    // component functions
    rowClicked(params) {
        this.selectedObject = params.data;
        this.isCanceled = false;
        this.params.api.stopEditing();
    }

    rowConfirmed() {
        if(this.gridApi.getSelectedRows()[0]) {
            this.selectedObject = this.gridApi.getSelectedRows()[0];
            this.isCanceled = false;
        }
        this.params.api.stopEditing(); 
    }

    onKeydown(event) {
        event.stopPropagation();
        if (event.key == "Escape") {
            this.params.api.stopEditing();
            return false;
        }
        if (event.key == "Enter" || event.key == "Tab") {
            this.rowConfirmed();
            return false;
        }
        if (event.key == "ArrowUp" || event.key == "ArrowDown") {
            this.navigateGrid();
            return false;
        } 
        window.setTimeout(() => {
            this.updateFilter(this.inputValue.toLowerCase());
        })
    }

    updateFilter(value) {
        console.log(value);
        this.filteredRowData = this.rowData.filter(row => 
            row[this.propertyName].toLowerCase().includes(value))
            .sort((a, b) => {
            if(a[this.propertyName] < b[this.propertyName]) { return -1; }
            if(a[this.propertyName] > b[this.propertyName]) { return 1; }
            return 0;});
        this.gridApi.setRowData(this.filteredRowData);
        if(this.filteredRowData[0]) this.gridApi.getRowNode(0).setSelected(true);
    }
 
    navigateGrid() {
        if(!this.gridApi.getFocusedCell()) {
            this.gridApi.setFocusedCell(0, this.propertyName);
            this.gridApi.getRowNode(0).setSelected(true);
        } else {
            this.gridApi.getRowNode(this.gridApi.getFocusedCell().rowIndex).setSelected(true);
        }
        
    }

}
