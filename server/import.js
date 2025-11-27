const fs = require("fs");
const csv = require("csv-parser");
const { MongoClient } = require("mongodb");
const path = require("path");

const uri = "mongodb://localhost:27017"; 
const client = new MongoClient(uri);

async function importCSV(filePath, collectionName, domain) {
  const results = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv({ headers: ['q','opt1','opt2','opt3','opt4','answer'], skipLines: 0 }))
      .on("data", (row) => {
        if (!row.q || !row.answer) return; 

        results.push({
          question: `${row.q}\nA) ${row.opt1}\nB) ${row.opt2}\nC) ${row.opt3}\nD) ${row.opt4}`,
          expected_answer: row.answer,
          chatgpt_response: "",
          domain: domain, 
        });
      })
      .on("end", async () => {
        try {
          const db = client.db("ChatGPT_Evaluation");
          const collection = db.collection(collectionName);
          await collection.insertMany(results);
          resolve(`Imported ${results.length} docs into ${collectionName}`);
        } catch (err) {
          reject(err);
        }
      });
  });
}

async function run() {
  try {
    await client.connect();

    console.log(await importCSV(path.join(__dirname, "../dataset/prehistory_test.csv"), "History", "History"));
    console.log(await importCSV(path.join(__dirname, "../dataset/sociology_test.csv"), "Social_Science", "Social_Science"));
    console.log(await importCSV(path.join(__dirname, "../dataset/computer_security_test.csv"), "Computer_Security", "Computer_Security"));

    console.log("All files imported!");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
