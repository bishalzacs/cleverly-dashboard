const fetch = require('node-fetch');

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/analytics');
        const json = await res.json();
        console.log("Success:", json.success);
        if (json.success) {
            console.log("Agent List Length:", json.data.agentList.length);
            console.log("First Agent:", json.data.agentList[0]);
        } else {
            console.log("Error:", json.error);
        }
    } catch (e) {
        console.log("Fetch Error:", e.message);
    }
}

test();
