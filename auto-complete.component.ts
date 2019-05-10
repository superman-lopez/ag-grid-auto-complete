import { Component, AfterViewInit, ViewChild, ViewEncapsulation, ElementRef } from '@angular/core';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { HttpClient } from '@angular/common/http';


@Component({
    selector: 'auto-complete',
    encapsulation: ViewEncapsulation.Emulated,
    host: { style: `position: absolute;
                    left: 0px; 
                    top: 0px;
                    background-color: transparent;
                    max-height: 200px;
                    max-width: 400px;
                    ` },
    template: ` 
    <div (keydown)="onKeydown($event)">
      <input 
          #input
		  [(ngModel)]="inputValue"
		  (ngModelChange)="processDataInput($event)"
          style=" height: 28px; font-weight: 400; font-size: 12px;"
          [style.width]="params.column.actualWidth + 'px'">
      <ag-grid-angular
		  style="font-weight: 150; height: 200px;" 
          class="ag-theme-balham"
          [rowData]="rowData" 
		  [columnDefs]="columnDefs"
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
    public params: any;
    public gridApi: any;
    public rowData: any;
    public columnDefs: [{}];
	public rowSelection: string = 'single';
	public columnFilter: any;
    // variables for component
    public returnObject: boolean;
    public cellValue: string;
    public filteredRowData: any;
    public inputValue: string;
    public apiEndpoint: string;
    public useApi: boolean;
    public propertyName: string;
    public isCanceled: boolean = true;
    public selectedObject: any = {
      }

    @ViewChild("input") input: ElementRef;

    constructor(private httpClient: HttpClient) {}

 
    ngAfterViewInit() {
        window.setTimeout(() => {
            if (this.inputValue == this.cellValue) {
                this.input.nativeElement.select();
            } else {
                this.input.nativeElement.focus();
            }
            if (this.inputValue && !this.useApi) this.updateFilter();
        })
	}
	
    // ICellEditorAngularComp functions
    agInit(params: any): void {
        this.params = params;
        if (!params.rowData) {
            this.apiEndpoint = params.apiEndpoint;
            this.useApi = true;
            this.rowData = [{}]
            // TODO: clean this up to have a valid dataRow
        } else {
            this.rowData = params.rowData;
        }
        this.columnDefs = params.columnDefs;
        this.propertyName = params.propertyRendered;
        this.cellValue = params.value[this.propertyName];
        this.returnObject = params.returnObject;

        if (!params.charPress) {
            if(this.cellValue) this.inputValue = this.cellValue;
        } else {
            this.inputValue = params.charPress;
        }
    }
    
    getValue(): any {
        if (!this.returnObject) return this.selectedObject[this.propertyName];
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
		this.columnFilter = this.gridApi.getFilterInstance(this.propertyName);
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
    }

    processDataInput(event) {
		if (this.useApi) {
			if (event.length == 0) this.gridApi.setRowData();
			if (event.length == 2) {
				this.getApiData(event).subscribe(data => { 
					this.rowData = data;
					setTimeout(() => {this.updateFilter()});
				});
			};
			if (event.length > 2) this.updateFilter();
		} else {
			this.updateFilter();
		}
    }
    
    getApiData(filter) {
        return this.httpClient.get(this.apiEndpoint + this.toQueryString(filter));
    }
    
    toQueryString(filter) {
        return "?" + this.propertyName + "=" + filter;
    }
    
    updateFilter() {
		this.columnFilter.setModel({
			type: 'startsWith',
			filter: this.inputValue,
		});
		this.columnFilter.onFilterChanged();
		if(this.gridApi.getDisplayedRowAtIndex(0)) this.gridApi.getDisplayedRowAtIndex(0).setSelected(true);
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
