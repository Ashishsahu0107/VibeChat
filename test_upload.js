const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function test() {
  try {
    fs.writeFileSync("test.webm", "dummy audio data");
    
    const form = new FormData();
    form.append("file", fs.createReadStream("test.webm"));
    
    // We need to bypass auth for this test, or we need a valid token.
    // Actually, I can just mock the controller directly!
  } catch(e) {
    console.log(e.response ? e.response.data : e.message);
  }
}
test();
