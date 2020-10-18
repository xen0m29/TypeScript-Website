// You can test it by running
// yarn danger pr https://github.com/microsoft/TypeScript-Website/pull/115

import { danger, message, markdown } from "danger"
import { basename } from "path"
import spellcheck from "danger-plugin-spellcheck"

// Blocked on PR deploys, see CI.yml
// import lighthouse from "danger-plugin-lighthouse"

// Spell check all the things
spellcheck({ settings: "microsoft/TypeScript-Website@spellcheck.json" })

const deployURL = process.env.PR_DEPLOY_URL_ROOT
if (deployURL) {
  const msg = `Deployed to [a PR branch](${deployURL}) - [playground](${deployURL}/play) [tsconfig](${deployURL}/tsconfig) [old handbook](${deployURL}/docs/handbook/integrating-with-build-tools.html)`
  message(msg)
}

// Look for new snapshots and show in a HTML table
const snapshots = danger.git.fileMatch("packages/typescriptlang-org/_tests/backstop_data/bitmaps_reference/*.png")
if (snapshots.modified) {
  const oldSha = danger.github.pr.base.sha
  const newSha = danger.github.pr.head.sha

  const tables = snapshots.getKeyedPaths().modified.map(p => {
    const oldURL = `https://raw.githubusercontent.com/microsoft/TypeScript-Website/${oldSha}/${p}`
    const newURL = `https://raw.githubusercontent.com/microsoft/TypeScript-Website/${newSha}/${p}`

    return `
###### \`${basename(p)}\`

Before             |  After
:-------------------------:|:-------------------------:
![](${oldURL})  |  ![](${newURL})
`
  })

  markdown(`## Snapshots updated\n\n ${tables.join("\n\n")}`)
}
