// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Parities.sol";

// This contract is owned by the dev.
// When new IFA tokens are minted, 5% will be sent here.
// Anyone can purchase IFA with iUSD/iBTC/iETH with a 5% discount.
// dev can withdraw any token other than IFA from it.
contract Costco is Parities, Ownable {
    using SafeMath for uint256;

    constructor(IFAMaster _ifaMaster) Parities(_ifaMaster) public {
    }

    // Anyone can buy IFA by iToken with 5% discount.
    function buyIFAWithiToken(address _itoken,  uint256 _itokenAmount) public {
        require(_itoken != address(0), "error iToken address");
        IERC20(_itoken).transferFrom(msg.sender, address(this), _itokenAmount);
        uint256 ifaAmount = _itokenAmount.mul(getIFAToiTokenRate(_itoken)) / 95;
        IERC20(ifaMaster.ifa()).transfer(msg.sender, ifaAmount);
    }

    // Dev can withdraw any token other than IFA and ETH.
    // Don't send ETH to this contract!
    function withdrawToken(address _token, uint256 _tokenAmount) public onlyOwner {
        require(_token != ifaMaster.ifa(), "anything other than IFA");

        IERC20(_token).transfer(msg.sender, _tokenAmount);
    }
}
