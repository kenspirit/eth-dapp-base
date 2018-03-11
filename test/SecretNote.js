const SecretNote = artifacts.require('SecretNote');

contract('SecretNote async/await style full test', async (accounts) => {
  it('Initial Note Count should be 0', async () => {
    const instance = await SecretNote.deployed();
    const initalCount = await instance.getTotalNoteCount();

    // initalCount is BigNumber object
    assert.equal(initalCount.valueOf(), 0);
  });

  it('Set and get Note', async () => {
    const instance = await SecretNote.deployed();
    const noteKey = 'key';
    const originNoteValue = 'value';

    await instance.setNote(noteKey, originNoteValue)
    const noteValue = await instance.getNote(noteKey);
    // Github issue: https://github.com/ethereum/web3.js/issues/337
    assert.equal(web3.toAscii(noteValue).replace(/\u0000/g, ''), originNoteValue);
  });

  it('Note Count is Correct After Setting Note', async () => {
    const instance = await SecretNote.deployed();
    const initalCount = await instance.getTotalNoteCount();

    assert.equal(initalCount.valueOf(), 1);
  });

  it('Exception should throw if not owner call getTotalNoteCount', async () => {
    // accounts[1] 是合约部署地址
    const notOwnerAccount = accounts[2];

    const instance = await SecretNote.deployed();

    try {
      const initalCount = await instance.getTotalNoteCount.call({ from: notOwnerAccount });
    } catch (e) {
      // Chai BDD style.  From truffle v4.0.7
      expect(e, 'I know it').to.exist;
    }
  });
});

contract('SecretNote then style and different contract', async (accounts) => {
  it('Initial Note Count', function() {
    return SecretNote.deployed()
      .then(function(instance) {
        return instance.getTotalNoteCount();
      })
      .then(function(initalCount) {
        // initalCount is BigNumber object
        assert.equal(initalCount.valueOf(), 0);
      })
  });
});
