import { spawn } from 'child_process'
import globby from 'globby'
import path from 'path'
import shelljs from 'shelljs'
import slash from 'slash'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const executePlaywright = (suitePath: string, baseTestFolder: string) => {
  console.log(`Executing ${suitePath}...`)
  const playwrightCfg = path.resolve(dirname, 'playwright.config.ts')

  const spawnDevArgs: string[] = ['dev']

  const appPath = path.resolve(dirname, 'support/app')
  const child = spawn('pnpm', spawnDevArgs, {
    stdio: 'inherit',
    cwd: appPath,
    env: { ...process.env }
  })

  const cmd = slash(`${playwrightBin} test ${suitePath} -c ${playwrightCfg}`)
  console.log('\n', cmd)
  const { code, stdout } = shelljs.exec(cmd, {
    cwd: appPath
  })

  shelljs.exec('killall -r "next-server"')

  const results = { code }
  testRunCodes.push(results)

  return stdout
}

shelljs.env.DISABLE_LOGGING = 'true'

const playwrightBin = path.resolve(dirname, '../node_modules/.bin/playwright')

const testRunCodes: { code: number }[] = []

const files = await globby(`${path.resolve(dirname).replace(/\\/g, '/')}/**/*e2e.spec.ts`)

console.log(`\nExecuting ${files.length} E2E tests...\n`)
console.log(`${files.join('\n')}\n`)

for (const file of files) {
  const baseTestFolder = file?.split('/test/')?.[1]?.split('/')?.[0]
  if (!baseTestFolder) {
    throw new Error(`No base test folder found for ${file}`)
  }
  executePlaywright(file, baseTestFolder)
}

console.log('\nRESULTS:')
testRunCodes.forEach(tr => {
  console.log(`\tSuccess: ${tr.code === 0}`)
})
console.log('\n')
