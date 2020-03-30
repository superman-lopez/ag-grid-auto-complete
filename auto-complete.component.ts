import { Component, AfterViewInit, ViewChild, ViewEncapsulation, ElementRef, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { GridReadyEvent, RowClickedEvent, ColDef, GridApi } from 'ag-grid-community';


@Component({
	selector: 'auto-complete',
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { style: `position: absolute;
					left: 0px; 
					top: 0px;
					overflow: visible;
					`
	},
    template: ` 
		<input #input
			[(ngModel)]="inputValue"
			(ngModelChange)="processDataInput($event)"
			style=" height: 28px; font-weight: 400; font-size: 12px;"
			[style.width]="params.column.actualWidth + 'px'">
		<ag-grid-angular
			style="font-weight: 150;" 
			[style.height]="gridHeight + 'px'"
			[style.max-width]="gridWidth + 'px'"
			class="ag-theme-balham"
			[rowData]="rowData" 
			[columnDefs]="columnDefs"
			[rowSelection]="rowSelection"
			[overlayNoRowsTemplate]="overlayNoRowsTemplate"
			(gridReady)="onGridReady($event)"
			(rowClicked)="rowClicked($event)">
		</ag-grid-angular>
	`
})
export class AgGridAutoCompleteComponent implements ICellEditorAngularComp, AfterViewInit, OnDestroy {
	// variables for agGrid
	public params: any;
	public gridApi: GridApi;
	public rowData: Array<any> = [];
	public columnDefs: Array<ColDef>;
	public rowSelection: string = 'single';
	public columnFilter: any;
	public overlayNoRowsTemplate: string; 
	// variables for component
	public returnObject: boolean;
	public clearInputValue: boolean;
	public cellValue: string;
	public filteredRowData: any;
	public inputValue: string;
	public useApi: boolean = false;
	public apiEndpoint: string;
	public queryChars: number = 2;
	public gridHeight: number = 175;
	public gridWidth: number = 375;
	public propertyName: string;
	public isCanceled: boolean = true;
	public selectedObject: any = {}

    @ViewChild("input") input: ElementRef;

    constructor(private httpClient: HttpClient, private changeDetection: ChangeDetectorRef) {}
 
	ngAfterViewInit() {
		window.setTimeout(() => {
			(this.inputValue == this.cellValue) ? this.input.nativeElement.select() : this.input.nativeElement.focus();
			if (this.inputValue && !this.useApi) this.updateFilter();
		})
	}

	// ICellEditorAngularComp functions
	agInit(params: any): void {
		this.params = params;
		if (!params.rowData) {
			this.apiEndpoint = params.apiEndpoint;
			this.useApi = true;
		} else {
			this.rowData = params.rowData;
		}
		if (params.gridHeight) this.gridHeight = params.gridHeight;
		if (params.gridWidth) this.gridWidth = params.gridWidth;

		if (params.queryChars > -1) this.queryChars = params.queryChars;
		this.columnDefs = params.columnDefs;
		this.propertyName = params.propertyRendered;
		this.returnObject = params.returnObject;
		this.clearInputValue = params.clearInputValue;
		
		this.cellValue = (params.propertyRendered == '' || params.returnObject == false || params.value == null) ? '' : params.value[this.propertyName];
		
		if (this.queryChars == 0) {
			this.overlayNoRowsTemplate = this.overLayLoading();
		} else {
			this.overlayNoRowsTemplate = this.overLayMinimumCharacters();
		}
		
		if (!params.charPress) {
			if(this.cellValue != null && !this.clearInputValue) this.inputValue = this.cellValue;
		} else {
			this.inputValue = params.charPress;
		}

		if (this.useApi == true && (this.queryChars == 0 || (this.inputValue != null && this.inputValue != '' && this.inputValue.length > this.queryChars))) {
			this.getApiData(this.inputValue).subscribe(data => { 
				this.rowData = data as Array<ColDef>;
				this.changeDetection.detectChanges();
				window.setTimeout(() => {this.updateFilter()});
			});
		} else {
			this.changeDetection.detectChanges();
		};
	}

	ngOnDestroy() {
		this.changeDetection.detach();
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
	onGridReady(event: GridReadyEvent): void {
		this.gridApi = event.api;
		this.gridApi.sizeColumnsToFit();
		this.columnFilter = this.gridApi.getFilterInstance(this.propertyName);
	}

	// component functions
	rowClicked(event: RowClickedEvent): void {
		this.selectedObject = event.data;
		this.isCanceled = false;
		this.params.api.stopEditing();
	}

	rowConfirmed(): void {
		if(this.gridApi.getSelectedRows()[0]) {
			this.selectedObject = this.gridApi.getSelectedRows()[0];
			this.isCanceled = false;
		}
		this.params.api.stopEditing(); 
	}

	@HostListener('keydown', ['$event'])
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

	processDataInput(inputValue: string): void {
		if (this.useApi == true) {
			if (inputValue.length < this.queryChars) {
				this.gridApi.setRowData([]);
			}
			if (inputValue.length == this.queryChars) {
				this.getApiData(inputValue).subscribe(data => { 
					this.rowData = data as Array<ColDef>;
					this.changeDetection.detectChanges();
					window.setTimeout(() => {this.updateFilter()});
				});
			};
			if (inputValue.length > this.queryChars) this.updateFilter();
		} else {
			this.updateFilter();
		}
	}

	getApiData(filter) {
		return this.httpClient.get(this.apiEndpoint + this.toQueryString(filter));
	}

	toQueryString(filter: string): string {
		return "?" + this.propertyName + "=" + filter;
	}

	updateFilter(): void {
		if (this.columnFilter && this.gridApi) {
			this.columnFilter.setModel({
				type: 'startsWith',
				filter: this.inputValue,
			});
			this.columnFilter.onFilterChanged();
		
			if(this.gridApi.getDisplayedRowAtIndex(0)) {
				this.gridApi.getDisplayedRowAtIndex(0).setSelected(true);
				this.gridApi.ensureIndexVisible(0, 'top');
			} else {
				this.gridApi.deselectAll();
			}
		}
	}

	navigateGrid(): void {
		if(this.gridApi.getFocusedCell() == null || this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex) == null) { // check if no cell has focus, or if focused cell is filtered
			this.gridApi.setFocusedCell(this.gridApi.getDisplayedRowAtIndex(0).rowIndex, this.propertyName);
			this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex).setSelected(true);
		} else {
			this.gridApi.setFocusedCell(this.gridApi.getFocusedCell().rowIndex, this.propertyName);
			this.gridApi.getDisplayedRowAtIndex(this.gridApi.getFocusedCell().rowIndex).setSelected(true);
		}
	}

	overLayLoading(): string {
		return '<span class="ag-overlay-no-rows-center">No rows to be shown. <br> Loading...</span>';
	}
	overLayMinimumCharacters(): string {
		return `<span class="ag-overlay-no-rows-center">No rows to be shown. <br> This search field requires at least ${this.queryChars} characters.</span>`
	}
}
