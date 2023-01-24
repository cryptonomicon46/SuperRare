// SPDX-License-Identifier: MIT
pragma solidity =0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./IERC721Receiver.sol";

contract SupeRareWrapper is Ownable  {   
    address public immutable SupeOriginalAddr;

        // Mapping from owner to operator approvals
    mapping (address => mapping (address => bool)) private _operatorApprovals;

    event ApprovedThisContract(uint256 tokenId);

    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    // Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    constructor (address _SupeOriginalAddr) {
        SupeOriginalAddr = _SupeOriginalAddr;

    }   



  /// @notice safeTransferFrom checks approval for this contract to use the asset before doing an ERC721 transfer
    /// @param from
    ///  emits a SwapCompleted event
    ///
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
       
    
        safeTransferFrom(from, to, tokenId, "");
    }


    function ApproveThisContract(uint tokenId) external view {
        require(SupeOriginalAddr.approvedFor(tokenId)!=address(0),"ERC721: operator query for nonexistent token");
        require(SupeOriginalAddr.ownerOf(tokenId)== msg.sender ||SupeOriginalAddr.approvedFor(tokenId)== msg.sender ,"NOT_OWNER_OR_APPROVED");
        SupeOriginalAddr.approve(address(this),tokenId);
        emit ApprovedThisContract(tokenId);
    
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override {
        require(_isApprovedOrOwner(address(this), tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);

    }


  /**
   * @dev Gets the approved address to take ownership of a given token ID
   * @param _tokenId uint256 ID of the token to query the approval of
   * @return address currently approved to take ownership of the given token ID
   */
  function getApproved(uint256 _tokenId) public view  returns (address) {
    // return tokenApprovals[_tokenId];
    return SupeOriginalAddr.approvedFor(_tokenId);
  }

/**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "ERC721: transfer caller is not owner nor approved");
        _safeTransfer(from, to, tokenId, _data);
    }




    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        // require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        require(SupeOriginalAddr.approvedFor(tokenId) != address(0),"ERC721: operator query for nonexistent token!" );

        address owner = SupeOriginalAddr.ownerOf(tokenId);
        // return (spender == owner || getApproved(tokenId) == spender || ERC721.isApprovedForAll(owner, spender));
        return (spender == owner || getApproved(tokenId) == spender);

    }



    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * `_data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is equivalent to {safeTransferFrom}, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _safeTransfer(address from, address to, uint256 tokenId, bytes memory _data) internal virtual {
        _transfer(from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

        /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(address from, address to, uint256 tokenId) internal virtual {
        // require(SupeOriginalAddr.ownerOf(tokenId) == from, "ERC721: transfer of token that is not own"); // internal owner
        require(to != address(0), "ERC721: transfer to the zero address");

        // _beforeTokenTransfer(from, to, tokenId);
        SupeOriginalAddr.transfer(to,tokenId);
        // Clear approvals from the previous owner
        // _approve(address(0), tokenId);

        // _holderTokens[from].remove(tokenId);
        // _holderTokens[to].add(tokenId);

        // _tokenOwners.set(tokenId, to);

        emit Transfer(from, to, tokenId);
    }



    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory _data)
        private returns (bool)
    {
        if (!to.isContract()) {
            return true;
        }
        bytes memory returndata = to.functionCall(abi.encodeWithSelector(
            IERC721Receiver(to).onERC721Received.selector,
            _msgSender(),
            from,
            tokenId,
            _data
        ), "ERC721: transfer to non ERC721Receiver implementer");
        bytes4 retval = abi.decode(returndata, (bytes4));
        return (retval == _ERC721_RECEIVED);
    }



}