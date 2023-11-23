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



module.exports = function(app,  client,dbName) {



// Function to check if the database exists
async function checkDatabaseExists() {
    try {
        await client.connect();
        const adminDb = client.db().admin();
        const dbs = await adminDb.listDatabases();
        const dbExists = dbs.databases.some(db => db.name === dbName);

        if (!dbExists) {
            console.log(`Database ${dbName} does not exist.`);
        } else {
            console.log(`Database ${dbName} exists.`);
        }
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    } finally {
        await client.close();
    }
}

// Check database existence at server startup
checkDatabaseExists();
}