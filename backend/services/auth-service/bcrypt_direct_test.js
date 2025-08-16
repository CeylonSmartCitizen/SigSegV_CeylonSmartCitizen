const bcrypt = require("bcryptjs");

async function test() {
    const password = "Simple123!";
    const hash = "$2a$12$lIRsnLcebF3sCZoK8zaedebDN8V/EY3romOltD7YdcgRm/5g6aNeC";
    
    console.log("Testing direct bcrypt comparison:");
    console.log("Password:", password);
    console.log("Hash:", hash);
    
    try {
        const result = await bcrypt.compare(password, hash);
        console.log("Result:", result);
        
        // Also test hashing the same password
        const newHash = await bcrypt.hash(password, 12);
        console.log("New hash from same password:", newHash);
        
        const newResult = await bcrypt.compare(password, newHash);
        console.log("New hash result:", newResult);
        
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
