// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.12;

interface IiToken {
    function itokensScalingFactor() external returns (uint256);

    function transferFrom(address from, address to, uint256 value) external;

    function burnFrom(address account, uint256 amount) external;

    function mint(address to, uint256 amount) external;
}