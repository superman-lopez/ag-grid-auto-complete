import {Component} from "@angular/core";

import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'auto-complete-cell',
    template: `{{ cellValue }}`
})

export class AutoCompleteRenderer implements ICellRendererAngularComp {
    private cellValue: any;
    public propertyName: string;

    agInit(params: any): void {
        this.setCell(params);
    }

    refresh(params: any): boolean {
        this.setCell(params);
        return true;
    }

    private setCell(params) {
        this.propertyName = params.propertyRendered;
        this.cellValue = params.value[this.propertyName];

    };
}
