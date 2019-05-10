# ag-grid-auto-complete
Autocomplete cellEditor for ag-Grid, made as Angular component.  There are dependencies on Ag-Grid Angular and HttpClient.  The component uses ag-theme-balham.

## Description
I was looking for an autocomplete cellEditor but could not find any.  I decided to write a component that would use ag-Grid for the presentation of the selection box.  I had the following requirements:
- Use keyboard input only, for start/end editing and selection.
- Be able to use mouse input.
- Start editing by typing.
- Autocomplete basis an existing array of values, or basis an API.
- Autocomplete basis text input, but actual selection being an object.

For the last requirement, the [stackblitz](https://stackblitz.com/edit/ag-grid-auto-complete) example will show an example of both returning an object and returning just a value.

![Screencast](https://im2.ezgif.com/tmp/ezgif-2-171c14541c7a.gif)

## Usage
This cellEditor can be used as an autocomplete text cell editor in for ag-Grid Angular.  In the app component, the column definitions need to include the necessary configuration details under `cellEditorParams`:
- `rowData` of the presented options, in ag-Grid compliant format.
- `apiEndpoint`is the url of the API endpoint (use this instead of `rowData`).
- `columnDefs` of the presented options, in ag-Grid compliant format.
- `propertyRendered` the field that is shown in the renderer, and thus used for the text autocomplete.
- `returnObject` boolean flag to return either the undelying object of the row, or the text value of the cell.  If enabled, the grid needs to be configured to show one value within the object.  Below has an example that uses `valueFormatter`.


## Example
```js  columnDefs = [
  { headerName: 'City', field: 'cityObject', editable: true, 
        cellEditor: 'autoComplete', 
        cellEditorParams: {
          'propertyRendered': 'city',
          'returnObject' : true,
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
	valueFormatter: (params) => {
		if (params.value) return params.value.city;
		return "";
	},
    },
  ```
  
  When an API is called, `rowData` can be left out and instead an API endpoint needs to be specified.  For example:
  ```js
  'apiEndpoint': '/api/cities/'
  ```
  The component will use `HttpClient` to call the API and will query with the first 2 characters of the input field, with the `propertyRendered` as the query key.  For example its query would be: `/api/cities/?city=Pa` when the input field shows "Paris".  Even though the API query would only be basis "Pa" the grid is further filtered in the component to match "Paris".
  
  ## Demonstration
  Demonstration on https://stackblitz.com/edit/ag-grid-auto-complete
