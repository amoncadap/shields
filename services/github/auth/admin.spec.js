'use strict'

const { expect } = require('chai')
const Camp = require('@shields_io/camp')
const portfinder = require('portfinder')
const got = require('../../../core/got-test-client')
const GithubApiProvider = require('../github-api-provider')
const { setRoutes } = require('./admin')

describe('GitHub admin route', function () {
  const shieldsSecret = '7'.repeat(40)

  let port, baseUrl
  before(async function () {
    port = await portfinder.getPortPromise()
    baseUrl = `http://127.0.0.1:${port}`
  })

  let camp
  before(async function () {
    camp = Camp.start({ port, hostname: '::' })
    await new Promise(resolve => camp.on('listening', () => resolve()))
  })
  after(async function () {
    if (camp) {
      await new Promise(resolve => camp.close(resolve))
      camp = undefined
    }
  })

  before(function () {
    const apiProvider = new GithubApiProvider({ withPooling: true })
    setRoutes({ shieldsSecret }, { apiProvider, server: camp })
  })

  context('the password is correct', function () {
    it('returns a valid JSON response', async function () {
      const { statusCode, body } = await got(`${baseUrl}/$github-auth/tokens`, {
        username: '',
        password: shieldsSecret,
        responseType: 'json',
      })
      expect(statusCode).to.equal(200)
      expect(body).to.be.ok
    })
  })

  // Disabled because this code isn't modified often and the test is very
  // slow. I wasn't able to make this work with fake timers:
  // https://github.com/sinonjs/sinon/issues/1739
  // context('the password is missing', function () {
  //   it('returns the expected message', async function () {
  //     this.timeout(11000)
  //     const res = await require('node-fetch')(`${baseUrl}/$github-auth/tokens`)
  //     expect(res.ok).to.be.true
  //     expect(await res.text()).to.equal('"Invalid secret."')
  //   })
  // })
})
