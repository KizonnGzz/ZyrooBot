import { spawn } from "child_process";

(function start() {
  const kizon = spawn(process.argv0, ["bot.js", "kizonn.js", ...process.argv.slice(2)], {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });
  kizon.on("message", (msg) => {
    if(msg === "restart") {
      bot.kill();
      bot.once("close", start);
    }
  }).on("exit", (code) => {
    if(code) start();
  }).on("error", console.log);
})();