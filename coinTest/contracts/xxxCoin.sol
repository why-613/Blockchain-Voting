// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
 
import "../node_modules/@OpenZeppelin/contracts/token/ERC20/ERC20.sol";
 
contract OoxxCoin is ERC20 {
    constructor() ERC20("OoxxCoin", "ooxxb") {
        _mint(msg.sender, 666666);// 初始化666666个ooxxb
    }
}