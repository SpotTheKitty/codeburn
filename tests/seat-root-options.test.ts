import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

import { afterEach, describe, expect, it } from 'vitest'

import { antigravity } from '../src/providers/antigravity.js'
import { getCursorDbPath } from '../src/providers/cursor.js'

const saved = {
  home: process.env['CODEBURN_ANTIGRAVITY_HOME'],
  db: process.env['CODEBURN_CURSOR_DB'],
}

afterEach(() => {
  if (saved.home === undefined) delete process.env['CODEBURN_ANTIGRAVITY_HOME']
  else process.env['CODEBURN_ANTIGRAVITY_HOME'] = saved.home
  if (saved.db === undefined) delete process.env['CODEBURN_CURSOR_DB']
  else process.env['CODEBURN_CURSOR_DB'] = saved.db
})

describe('seat root options', () => {
  it('CODEBURN_CURSOR_DB names the Cursor state database', () => {
    process.env['CODEBURN_CURSOR_DB'] = join(tmpdir(), 'seat', 'state.vscdb')
    expect(getCursorDbPath()).toBe(join(tmpdir(), 'seat', 'state.vscdb'))
  })

  it('CODEBURN_ANTIGRAVITY_HOME redirects antigravity session discovery', async () => {
    const home = await mkdtemp(join(tmpdir(), 'cb-agy-'))
    try {
      const dir = join(home, '.gemini', 'antigravity-cli', 'conversations')
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, 'seat-conv.db'), 'not a real database')
      process.env['CODEBURN_ANTIGRAVITY_HOME'] = home
      const sources = await antigravity.discoverSessions()
      expect(sources.some(s => s.path === join(dir, 'seat-conv.db'))).toBe(true)
    } finally {
      await rm(home, { recursive: true, force: true })
    }
  })
})
