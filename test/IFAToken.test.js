const { expectRevert } = require('@openzeppelin/test-helpers');
const IFAToken = artifacts.require('IFAToken');

contract('IFAToken', ([createIFA, bob, carol]) => {
    beforeEach(async () => {
        this.ifa = await IFAToken.new({ from: createIFA });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.ifa.name();
        const symbol = await this.ifa.symbol();
        const decimals = await this.ifa.decimals();
        assert.equal(name.valueOf(), 'IFAToken');
        assert.equal(symbol.valueOf(), 'IFA');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.ifa.mint(createIFA, '100', { from: createIFA });
        await this.ifa.mint(bob, '1000', { from: createIFA });
        await expectRevert(
            this.ifa.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.ifa.totalSupply();
        const createIFABal = await this.ifa.balanceOf(createIFA);
        const bobBal = await this.ifa.balanceOf(bob);
        const carolBal = await this.ifa.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(createIFABal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.ifa.mint(createIFA, '100', { from: createIFA });
        await this.ifa.mint(bob, '1000', { from: createIFA });
        await this.ifa.transfer(carol, '10', { from: createIFA });
        await this.ifa.transfer(carol, '100', { from: bob });
        const totalSupply = await this.ifa.totalSupply();
        const createIFABal = await this.ifa.balanceOf(createIFA);
        const bobBal = await this.ifa.balanceOf(bob);
        const carolBal = await this.ifa.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(createIFABal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.ifa.mint(createIFA, '100', { from: createIFA });
        await expectRevert(
            this.ifa.transfer(carol, '110', { from: createIFA }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.ifa.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });
