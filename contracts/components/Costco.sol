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
    uint256 public discount;

    constructor(IFAMaster _ifaMaster) Parities(_ifaMaster) public {
        discount = 98;
    }

    function setDiscount(uint256 _discount) external onlyOwner {
        require(_discount > 0 && _discount < 100, "error discount");
        discount = _discount;
    }
    // Anyone can buy IFA by iToken with [discount]% discount.
    function buyIFAWithiToken(address _itoken, uint256 _itokenAmount) public {
        require(_itoken != address(0), "error rToken address");
        IERC20(_itoken).transferFrom(msg.sender, address(this), _itokenAmount);
        uint256 ifaAmount = _itokenAmount.mul(getIFAToiTokenRate(_itoken)) / discount;
        IERC20(ifaMaster.ifa()).transfer(msg.sender, ifaAmount);
    }

    // Dev can withdraw any token other than IFA and ETH.
    // Don't send ETH to this contract!
    function withdrawToken(address _token, uint256 _tokenAmount) public onlyOwner {
        require(_token != ifaMaster.ifa(), "anything other than RICE");

        IERC20(_token).transfer(msg.sender, _tokenAmount);
    }
}
