/*!
 * Copyright (c) 2023 Mediasoft & Cie S.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const odbc = require('odbc');

class OdbcDatabase {
    constructor(connectionString) {
        this.connectionString = connectionString;
    }

    async connect() {        
        try {
            const connectionConfig = {
                connectionString: this.connectionString,
                connectionTimeout: 10,
                loginTimeout: 10,
            }
            this.connection = await odbc.connect(connectionConfig);
            this.connection.setIsolationLevel(odbc.SQL_TXN_READ_UNCOMMITTED);
        } catch (err) {
            console.log('Error connecting to the database:', err);
          //  throw err;
        }
    }

    async connectWrite() {
        try {
            const connectionConfig = {
                connectionString: this.connectionString,
                connectionTimeout: 10,
                loginTimeout: 10,
            }
            this.connection = await odbc.connect(connectionConfig);
            this.connection.setIsolationLevel(odbc.SQL_TXN_READ_COMMITTED);
        } catch (err) {
            console.log('Error connecting to the database:', err);
          //  throw err;
        }
    }

    async getTableStructure(tableName) {
        try {
            const query = `SELECT * FROM ${tableName} WHERE 1=0`; // Query that returns no data but column info
            const result = await this.connection.query(query);
            return result.columns;
        } catch (err) {
            console.log('Error retrieving table structure:', err);
         //   throw err;
        }
    }

    async queryData(queryString) {
        try {
            const result = await this.connection.query(queryString);
            return result;
        } catch (err) {
            console.log('Error querying data:', err);
           // throw err;
        }
    }

    async updateData(updateQuery) {
        try {
            const result = await this.connection.query(updateQuery);
            return result;
        } catch (err) {
            console.log('Error updating data:', err);
           // throw err;
        }
    }

    async deleteData(deleteQuery) {
        try {
            const result = await this.connection.query(deleteQuery);
            return result;
        } catch (err) {
            console.log('Error deleting data:', err);
          //  throw err;
        }
    }

    async close() {
        try {
            await this.connection.close();
        } catch (err) {
            console.log('Error closing the database connection:', err);
     }
    }

 
    async getTablesList() {
        try {
            // Query to get list of tables in OpenEdge
            console.log("getTablesList");
            const query = `SELECT "_File-Name" name, "_Desc" label FROM PUB."_File" WHERE "_file-Number">0`;
            const result = await this.connection.query(query);
            return result;
        } catch (err) {
            console.log('Error retrieving tables list:', err);
           // throw err;
        }
    }

    async getTableFields(tableName) {
        try {
            // Query to get fields of a table in OpenEdge
            const query = `SELECT "_Field-Name" Name, "_Data-Type" TYPE, "_Label" LABEL FROM PUB."_Field" WHERE PUB."_Field"."_File-Recid" = (SELECT ROWID FROM PUB."_File" WHERE "_File-Name" = '${tableName}')`;
            console.log(query);
            const result = await this.connection.query(query);
            return result;
        } catch (err) {
            
            console.log(`Error retrieving fields for table ${tableName}:`, err);
          //  throw err;
        }
    }

    async getTableIndexes(tableName) {
        try {
            // Query to get indexes of a table in OpenEdge
            const query = `select "_index-name" Name from PUB."_index" idx, PUB."_file" fi where fi."_file-name"='${tableName}' and idx.rowid =(select"_file"."_prime-index" from PUB."_file" fs where fs."_file-name"='${tableName}')`; 
            console.log(query);
            const result = await this.connection.query(query);
            return result;
        } catch (err) {
            console.log(`Error retrieving indexes for table ${tableName}:`, err);
          //  throw err;
        }
    }

    async queryDataWithPagination(tableName, page, pageSize) {
        try {
            const offset = (page - 1) * pageSize;
            const paginatedQuery = `select * FROM PUB."${tableName}" OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
            console.log(paginatedQuery)
            const result = await this.connection.query(paginatedQuery);
            return result;
        } catch (err) {
            console.error('Error querying data with pagination:', err);
            throw err;
        }
    }

// CURSOR

 // Move to the first record
 async moveToFirst(tableName) {
    const query = `SELECT TOP 1 * FROM ${tableName} `;
    return this.queryData(query);
}

// Move to the last record
async moveToLast(tableName) {
    // OpenEdge doesn't have a direct way to select the last record, so you might need to use an ORDER BY clause
    // with DESC and then select the TOP 1 record. This assumes you have a column to order by.
    const orderByColumn = 'your_order_by_column'; // Replace with your actual column
    const query = `SELECT * FROM ${tableName} ORDER BY 1 desc `;    
    return this.queryData(query);
}

// Move to the next record
async moveToNext(tableName, currentRowId) {
    // Assuming 'currentRowId' is the ROWID of the current record
    const query = `SELECT * FROM ${tableName}  OFFSET ${currentRowId} ROWS FETCH NEXT 1 ROWS ONLY`;
    console.log(query);
    return this.queryData(query);
}

// Move to the previous record
async moveToPrevious(tableName, currentRowId) {
    // This is a bit tricky as OpenEdge doesn't support fetching the previous record directly
    // You might need to fetch all records with ROWID less than the current one and then take the last one
    const query = `SELECT * FROM ${tableName} OFFSET ${currentRowId} ROWS FETCH NEXT 1 ROWS ONLY`;
    console.log(query);
    return this.queryData(query);
}

// Move to the next record
async getROWID(tableName, currentRowId) {
    // Assuming 'currentRowId' is the ROWID of the current record
    const query = `SELECT ROWID FROM ${tableName}  OFFSET ${currentRowId} ROWS FETCH NEXT 1 ROWS ONLY`;
    console.log(query);
    return this.queryData(query);
}

async updateRecord(tableName, data, rowID) {
    try {
        
        // Construct the full SQL statement
        const sql = `UPDATE ${tableName} SET ${data.body} WHERE ROWID = '${rowID}'`;
  
       console.log(sql);
        // Execute the query
        const result = await this.connection.query(sql);
        
        return result;
    } catch (err) {
        console.log('Error updating record:', err);
        throw err;
    }
}

}

module.exports = OdbcDatabase;
