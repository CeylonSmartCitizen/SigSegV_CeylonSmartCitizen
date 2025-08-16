const bcrypt = require("bcryptjs");

async function testBcrypt() {
    const password = "DebugPass123!";
    const hash = "$2a$12$uUuK8tlU/vkpxj7sUScak.5Gc0n7okYTLVY2Y2zqUKD97sf6BSXi2";
    
    console.log("Testing bcrypt comparison:");
    console.log("Password:", password);
    console.log("Hash:", hash);
    
    const result = await bcrypt.compare(password, hash);
    console.log("Comparison result:", result);
    
    // Also test creating a new hash
    const newHash = await bcrypt.hash(password, 12);
    console.log("New hash:", newHash);
    
    const newResult = await bcrypt.compare(password, newHash);
    console.log("New hash comparison:", newResult);
}

testBcrypt().catch(console.error);
