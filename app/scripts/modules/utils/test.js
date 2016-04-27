
var React = require('react');
var FixedDataTable = require('fixed-data-table');

var Table = FixedDataTable.Table;
var Column = FixedDataTable.Column;

// Table data as a list of array.
var rows = [
  ['a1', 'b1', 'c1'],
  ['a2', 'b2', 'c2'],
  ['a3', 'b3', 'c3'],
  // .... and more
];

function rowGetter(rowIndex) {
    console.log(1);
  return rows[rowIndex];
}

var Example = React.createClass({
    render: function() {
        console.log("RENDERING");
      return <Table
        rowHeight={50}
        rowGetter={rowGetter}
        rowsCount={rows.length}
        width={500}
        height={500}
        headerHeight={50}>
        <Column
          label="Col 1"
          width={300}
          dataKey={0}
          fixed={false}
        />
        <Column
          label="Col 2"
          width={200}
          dataKey={1}
          fixed={false}
        />
      </Table>;
  }
});


//var DataGrid = require('react-datagrid')
//var rows = [
//  {id:0, A:'a1', B:'b1', C:'c1'},
//  {id:1, A:'a2', B:'b2', C:'c2'},
//  {id:2, A:'a3', B:'b3', C:'c3'},
//  // .... and more
//];
//var columns = [
//	{ name: 'A', title: '#', width: 50 },
//	{ name: 'B', width: 60 },
//	{ name: 'C', width: 70  },
//];
//var Example = React.createClass({
//    render: function() {
//        return <DataGrid
//            ref="dataGrid"
//            idProperty='id'
//            dataSource={rows}
//            columns={columns}
//            style={{height: 400}}
//            withColumnMenu={false}
//        />
//    }
//});

module.exports = Example;
