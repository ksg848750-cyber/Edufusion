const testJSON = {
  scene: ["Step 1", "Step 2"],
  deep_dive: ["Deep 1", "Deep 2"]
};

console.log('Is scene array:', Array.isArray(testJSON.scene));
console.log('Is deep_dive array:', Array.isArray(testJSON.deep_dive));

if (!Array.isArray(testJSON.scene) || !Array.isArray(testJSON.deep_dive)) {
  console.error('FAIL: Expected arrays!');
  process.exit(1);
}
console.log('PASS: Arrays confirmed.');
process.exit(0);
