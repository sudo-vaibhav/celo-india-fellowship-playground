// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.5.16;

contract Sticker{
    string public imagePath="QmSEn6LZYy4ifSRfYSXoC2yJJXZNoe8zf1hNqtTRkUoS2u";
    function setSticker(string memory _imagePath) public{
        imagePath = _imagePath;
    }
}
