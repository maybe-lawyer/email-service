const { expect } = require('chai');
const got = require('got');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const {  
  // spendgridHandler,
  validateBody,
} = require('../emailHandlers');

const makeFakeRes = () => ({
  status: sinon.spy(),
  send: sinon.spy()
});

const makeValidBody = () => ({
  to: 'susan@abcpreschool.org',
  to_name: 'Miss Susan',
  from: 'dwschrashun@gmail.com',
  from_name: 'Doug Schrashun',
  subject: 'Your Weekly Report',
  body: '<h1>hi</h1>'
});

describe('validateBody', () => {
  it('returns true for valid body', () => {
    expect(validateBody(makeValidBody())).to.equal(true);
  });
  it('throws error if missing a required field', () => {
    const missingField = {
      to: 'susan@abcpreschool.org', 
      to_name: 'Miss Susan', 
      from: 'dwschrashungmail.com', 
      from_name: 'Doug Schrashun', 
      subject: 'Your Weekly Report', 
    }
    const validateMissingField = () => validateBody(missingField);
    expect(validateMissingField).to.throw();
  });

  it('throws error on invalid email address', () => {
    const badEmail = {
      to: 'susanabcpreschool.org', 
      to_name: 'Miss Susan', 
      from: 'dwschrashungmail.com', 
      from_name: 'Doug Schrashun', 
      subject: 'Your Weekly Report', 
      body: '<h1>hi</h1>'
    }
    const validateBadEmail = () => validateBody(badEmail);
    expect(validateBadEmail).to.throw();
  });
});

describe('spendgridHandler', () => {
  let gotStub;
  beforeEach(() => {
    gotStub = sinon.stub();
    gotStub.returns({ statusCode: 200, body: 'fake test success' });
  })
  it('calls got with expected arguments', (done) => {
    const { spendgridHandler } = proxyquire('../emailHandlers', {
      'got': function (url, options) {
        return gotStub(url, options);
      }
    });
    const fakeRes = makeFakeRes();
    const fakeBody = makeValidBody();
    const fakeReq = {
      body: fakeBody
    };

    const stringBody = JSON.stringify({
      subject: 'Your Weekly Report',
      body: 'HI',
      sender: 'Doug Schrashun <dwschrashun@gmail.com>',
      recipient: 'Miss Susan <susan@abcpreschool.org>',
    });
    const expectedOptions = {
      method: 'POST',
      body: stringBody,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': 'test_key',
      }
    };

    spendgridHandler(fakeReq, fakeRes).then(() => {
      expect(gotStub.calledOnce).to.equal(true);
      expect(gotStub.args[0][0]).to.equal('http://test.com')
      expect(gotStub.args[0][1]).to.deep.equal(expectedOptions)
      done();
    }).catch(() => {
      expect(true).to.equal(false);
      done();
    });
  });

  it('calls res methods with proper arguments', (done) => {
    const { spendgridHandler } = proxyquire('../emailHandlers', {
      'got': function (url, options) {
        return gotStub(url, options);
      }
    });
    const fakeRes = makeFakeRes();
    const fakeBody = makeValidBody();
    const fakeReq = {
      body: fakeBody
    };

    spendgridHandler(fakeReq, fakeRes).then(() => {
      expect(fakeRes.status.calledOnce).to.equal(true);
      expect(fakeRes.status.args[0][0]).to.equal(200);
      expect(fakeRes.send.calledOnce).to.equal(true);
      expect(fakeRes.send.args[0][0]).to.deep.equal({ message: 'fake test success' });
      done();
    }).catch(() => {
      expect(true).to.equal(false);
      done();
    });
  });
});
