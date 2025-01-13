const fs = require('fs');
const path = 'C:\\MeshroomTest\\output\\texturedMesh.obj';

fs.access(path, fs.F_OK, (err) => {
  if (err) {
    console.error(`File does not exist at ${path}`);
    return;
  }
  console.log(`File exists at ${path}`);
  
  fs.stat(path, (err, stats) => {
    if (err) {
      console.error(`Error getting file stats: ${err}`);
      return;
    }
    console.log(`File size: ${stats.size} bytes`);
    console.log(`Last modified: ${stats.mtime}`);
  });
});