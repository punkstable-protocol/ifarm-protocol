// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../uniswapv2/interfaces/IUniswapV2Pair.sol";
import "../uniswapv2/interfaces/IUniswapV2Factory.sol";
import "../IFAMaster.sol";

contract Parities {
    using SafeMath for uint256;

    uint256 constant K_MADE_iUSD = 1;
    uint256 constant K_MADE_iBTC = 2;
    uint256 constant K_MADE_iETH = 3;


    IFAMaster public ifaMaster;

    constructor(IFAMaster _ifaMaster) public {
        ifaMaster = _ifaMaster;
    }

    // How many IFA tokens can be bought by 100 iToken.
    function getIFAToiTokenRate(address _itoken) public view returns (uint256) {
        require(_itoken != address(0), "error iToken address");
        uint256 key = ifaMaster.iTokenKey(_itoken);
        require(key == K_MADE_iUSD || key == K_MADE_iBTC || key == K_MADE_iETH, "Not supported iToken");
        if (key == K_MADE_iUSD) {
            (uint256 r0, uint256 r1) = getReserveRatio(ifaMaster.sCRV(), _itoken);
            (uint256 r2, uint256 r3) = getReserveRatio(ifaMaster.sCRV(), ifaMaster.ifa());
            return r3.mul(r0).mul(100).div(r2).div(r1);
        }
        if (key == K_MADE_iBTC) {
            (uint256 r0, uint256 r1) = getReserveRatio(ifaMaster.btcCRV(), _itoken);
            (uint256 r2, uint256 r3) = getReserveRatio(ifaMaster.btcCRV(), ifaMaster.ifa());
            return r3.mul(r0).mul(100).div(r2).div(r1);
        }
        if (key == K_MADE_iETH) {
            (uint256 r0, uint256 r1) = getReserveRatio(ifaMaster.wETH(), _itoken);
            (uint256 r2, uint256 r3) = getReserveRatio(ifaMaster.wETH(), ifaMaster.ifa());
            return r3.mul(r0).mul(100).div(r2).div(r1);
        }
        return 0;
    }

    function getReserveRatio(address token0, address token1) public view returns (uint256, uint256) {
        IUniswapV2Factory factory = IUniswapV2Factory(ifaMaster.uniswapV2Factory());
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(token0, token1));
        (uint256 reserve0, uint256 reserve1,) = pair.getReserves();
        if (pair.token0() == token0) {
            return (reserve0, reserve1);
        } else {
            return (reserve1, reserve0);
        }
    }
}
