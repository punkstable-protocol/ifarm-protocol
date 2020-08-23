# ifarm Protocol
## The Protocol
ifarm is an experimental protocol building upon the most exciting innovations in programmable money and governance. Built by a team of DeFi natives, it seeks to create:

•	a next generation Yield Farming aggregator<br/>
•	fully on-chain governance to enable decentralized control and evolution from it under stable<br/>
•	a fair distribution mechanism that incentivizes key community members to actively take the reins of governance

We have built ifarm to be a minimally viable monetary experiment, and at launch there will be zero value in the IFA token. After deployment, it is entirely dependent upon IFA holders to determine its value and future development. We have employed a fork of the Compound governance module, which will ensure all updates to the ifarm protocol happen entirely on-chain through community voting.

## Audits

None. Contributors have given their best efforts to ensure the security of these contracts, but make no guarantees. It has been spot checked by just a few pairs of eyes. It is a probability - not just a possibility - that there are bugs. That said, minimal changes were made to the staking/distribution contracts that have seen hundreds of millions flow through them via SNX, YFI, and YFI derivatives. The reserve contract is excessively simple as well. We prioritized staked assets' security first and foremost.

The original devs encourage governance to fund a bug bounty/security audit

The token itself is largely based on COMP and which have undergone audits - but we made non-trivial changes.

If you feel uncomfortable with these disclosures, don't stake or hold IFA. If the community votes to fund an audit, or the community is gifted an audit, there is no assumption that the original devs will be around to implement fixes, and is entirely at their discretion.



## Distribution
Rather than allocating a portion of the supply to the founding team, IFA is being distributed in the spirit of YFI: no premine, no founder shares, no VC interests — simply equal-opportunity staking distribution to attract a broad and vision-aligned community to steward the future of the protocol and token.

The initial distribution of IFA will be evenly distributed across staking pools: e.g. WETH, YFI, MKR, LEND, LINK, SNX, COMP tokens. These pools were chosen intentionally to reach a broad swath of the overall DeFi community, as well as specific communities with a proven commitment to active governance and an understanding of complex tokenomics.

## Governance
Governance is entirely dictated by IFA holders from the start. Upon deployment, ownership of all IFA protocol contracts was relinquished to the timelocked Governance contract or removed entirely. At the very least, this can be seen as a reference implementation for a truly decentralized protocol.

# Development
### Building
This repo uses truffle. Ensure that you have truffle installed. Given the composability aspect of this

Then, to build the contracts run:
```
$ truffle compile
```



To run tests, run against a single test package, i.e.:
```
$ sh startBlockchain.sh
$ truffle migrate --network distribution
$ python scripts/clean.py
$ cd jsLib
$ jest deployment
$ jest token
$ jest rebase
$ jest governance
$ jest governorAlpha
$ jest distribution
```
The need to run one-by-one seems to be a limitation of jest + ganache.

The distribution tests require specific tokens. These are acquired by using the ganache unlock_account function. If you receive fails, the owner likely decreased their ownership of that token. Just replace any instances of that address with another holder of the token.

Note: some governance tests require a different ganache setup. You will encounter a warning (but not a failed test) if the wrong type of ganache is setup. To run the correct one:
```
$ sh startBlockchainMining.sh
$ truffle migrate --network distribution
$ python scripts/clean.py
$ cd jsLib
$ jest governance
```


#### Attributions
Much of this codebase is modified from existing works, including:

[Compound](https://compound.finance) - Jumping off point for token code and governance

[Synthetix](https://synthetix.io) - Rewards staking contract

[YEarn](https://yearn.finance)/[YFI](https://ygov.finance) - Initial fair distribution implementation

[YAM](https://yam.finance)/[YAM](https://ygov.finance) - Initial fair distribution implementation and an elastic supply to seek eventual price stability
