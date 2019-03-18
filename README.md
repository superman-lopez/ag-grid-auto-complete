# ag-grid-auto-complete
Autocomplete cellEditor for ag-Grid, made in Angular component.

## Description
I was looking for an autocomplete cellEditor but could not find any.  I decided to write a component that would use ag-Grid for the presentation of the selection box.  I had the following requirements:
- Use keyboard input only, for start/end editing and selection.
- Be able to use mouse input.
- Start editing by typing.
- Autocomplete basis text input, but actual selection being an object.

For the last requirement I wrote an accompanying cellRenderer.  The selection of the object is not mandatory, but the [stackblitz](https://stackblitz.com/edit/ag-grid-auto-complete) example will show both.
## Usage
This cellEditor can be used as an autocomplete text cell editor in for ag-Grid Angular.  In the app component, the column definitions need to include the necessary configuration details under `cellEditorParams`:
- `rowData` of the presented options, in ag-Grid compliant format.
- `columnDefs` of the presented options, in ag-Grid compliant format.
- `propertyRendered` the field that is shown in the renderer, and thus used for the text autocomplete.

And optionally for the cellRenderer the following configuration is needed under `cellRendererParams`
- `propertyRendered` the field that is shown in the renderer.

## Example
```  columnDefs = [
  { headerName: 'City', field: 'cityObject', editable: true, 
    cellEditor: 'autoComplete', 
    cellEditorParams: {
      'propertyRendered': 'city',
      'rowData': [
        { 'id': 1, 'city': 'Paris', 'country': 'France' },
        { 'id': 2, 'city': 'London', 'country': 'United Kingdom' },
        { 'id': 3, 'city': 'Berlin', 'country': 'Germany' },
        { 'id': 4, 'city': 'Madrid', 'country': 'Spain' },
        { 'id': 5, 'city': 'Rome', 'country': 'Italy' },
        { 'id': 6, 'city': 'Copenhagen', 'country': 'Denmark' },
        { 'id': 7, 'city': 'Brussels', 'country': 'Belgium' },
        { 'id': 8, 'city': 'Amsterdam', 'country': 'The Netherlands' }],
      'columnDefs': [
          {headerName: 'City', field: 'city' },
          {headerName: 'Country', field: 'country' }]
    },
    cellRenderer: 'autoRenderer',
    cellRendererParams: {
      'propertyRendered': 'city'
    }

  }]
  ```
  ## Demonstration
  Demonstration on https://stackblitz.com/edit/ag-grid-auto-complete
