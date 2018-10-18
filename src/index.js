
const path = require('path')
const consola = require('consola')
const webpack = require('webpack')
const fs = require('fs-extra')
const path = require('path')
const lodash = require('lodash')
const mdit = require('markdown-it')()
const logger = consola.withScope('nuxt:press')

const loadEntries = () => {
  const entriesRoot = path.resolve(__dirname, 'entries')
  const entries = []
  const dirEntries = fs.readdirSync(entriesRoot)
  for (let i = 0; i < dirEntries.length; i++) {
    const validEntry = loadEntry(path.join(entriesRoot, dirEntries[i]))
    if (validEntry) {
      entries.push(
        Object.assign({}, {
          permalink: generateEntryPermalink(validEntry.title, validEntry.published),
          published: validEntry.published.toISOString()
        }, validEntry)
      )
    }
  }
  entries.sort((a, b) => {
    return b.published - a.published
  })
  return entries
}

const generateEntryPermalink = (title, published) => {
  const slug = title.replace(/\s+/g, '-')
  const date = published.toString().split(/\s+/).slice(1, 4).reverse()
  return `${date[0]}/${date[2]}/${date[1]}/${slug}`
}

const generateIndex = () => {
  fs.writeFileSync(
    path.resolve(__dirname, 'entries.json'),
    JSON.stringify(entries, null, 2)
  )
}

const generateFeeds = () => {
  const rssFeedTemplate = lodash.template(
    fs.readFileSync('./feeds/rss.xml.template', 'utf8')
  )
  const atomFeedTemplate = lodash.template(
    fs.readFileSync('./feeds/atom.xml.template', 'utf8')
  )
  const data = {
    entries: entries.slice(0, 10),
    domain
  }
  fs.writeFileSync('./static/rss.xml', rssFeedTemplate(data))
  fs.writeFileSync('./static/atom.xml', atomFeedTemplate(data))
}

// new webpack.IgnorePlugin(/^entries/),
// new CopyWebpackPlugin([
//   { from: 'entries/*', to: 'entries/' },
//   { from: 'pages/*.md', to: 'pages/' }
// ])

module.exports = function nuxtPress (_options) {
  _options = Object.assign({}, this.options.press, _options)
}