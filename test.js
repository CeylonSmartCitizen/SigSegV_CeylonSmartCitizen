const bcrypt = require("bcryptjs");
async function test() {
    const password = "DebugPass123!";
    const hash = "$2a$12$uUuK8tlU/vkpxj7sUScak.5Gc0n7okYTLVY2Y2zqUKD97sf6BSXi2";
    const result = await bcrypt.compare(password, hash);
    console.log("Bcrypt test result:", result);
}
test().catch(console.error);
