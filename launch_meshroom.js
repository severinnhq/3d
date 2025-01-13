const { exec } = require('child_process');

const meshroomPath = '"C:\\Meshroom\\Meshroom-2023.3.0-win64\\Meshroom-2023.3.0\\meshroom_batch.exe"';

exec(meshroomPath, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`Meshroom launched successfully: ${stdout}`);
});