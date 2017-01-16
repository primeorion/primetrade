/**
 * 
 */

module.exports = {
		tableName : 'buyPriority',
		columns : {
			id : 'buyPriority.id',
			displayName : 'buyPriority.displayName',
			code : 'buyPriority.code'
		}
		,alias : function(alias, column){
			var self = this;
			var columnName = self.columns[column];
			if(columnName){
				var arr = columnName.split(".");
				if(arr && arr.length > 0){
					return alias + "." + arr[1];
				}
			}
			return null;
		}
}